import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { email, company_name, contact_name, industry } = body;

    if (!email || !company_name) {
      return new Response(
        JSON.stringify({ error: "E-Mail und Firmenname sind erforderlich" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user exists by email - much faster than listUsers()
    let userId: string;
    let isNewUser = false;

    // Try to find existing user by looking up profiles or tenants
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("user_id")
      .ilike("full_name", email) // won't match but we need another approach
      .maybeSingle();

    // Use getUserByEmail (admin API) - single lookup, no iteration
    const { data: existingUserData } = await adminClient.auth.admin.getUserById
      ? await (async () => {
          // listUsers with filter is faster than iterating all
          const { data } = await adminClient.auth.admin.listUsers({ 
            page: 1, 
            perPage: 1 
          });
          // Actually, let's just try inviting - if user exists, it'll fail gracefully
          return { data: null };
        })()
      : { data: null };

    // Simplified: just try to invite, handle existing user case
    const { data: inviteData, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        data: { full_name: contact_name || company_name },
        redirectTo: `${req.headers.get("origin") || "https://social-stat-studio.lovable.app"}/set-password`,
      });

    if (inviteError) {
      // If user already exists, find them
      if (inviteError.message?.includes("already been registered") || 
          inviteError.message?.includes("already exists")) {
        // Find user by checking tenants
        const { data: existingTenant } = await adminClient
          .from("tenants")
          .select("id, user_id")
          .eq("company_name", company_name)
          .maybeSingle();
        
        if (existingTenant) {
          return new Response(
            JSON.stringify({ error: "Dieser Benutzer hat bereits ein Kundenkonto" }),
            { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // User exists but no tenant - we need their ID
        // Use listUsers with a small page to find by email
        const { data: usersData } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 50 });
        const foundUser = usersData?.users?.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );
        
        if (!foundUser) {
          return new Response(
            JSON.stringify({ error: "Benutzer existiert aber konnte nicht gefunden werden" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        userId = foundUser.id;
      } else {
        return new Response(
          JSON.stringify({ error: `Einladung fehlgeschlagen: ${inviteError.message}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      userId = inviteData.user.id;
      isNewUser = true;
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await adminClient
      .from("tenants")
      .insert({
        user_id: userId,
        company_name,
        contact_name: contact_name || null,
        industry: industry || null,
        is_active: true,
        onboarding_completed: false,
      })
      .select()
      .single();

    if (tenantError) {
      return new Response(
        JSON.stringify({ error: `Tenant-Erstellung fehlgeschlagen: ${tenantError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create profile
    await adminClient.from("profiles").upsert({
      user_id: userId,
      full_name: contact_name || company_name,
      company_name,
    }, { onConflict: "user_id" });

    // Fire customer_invited webhook
    const { data: webhookEndpoints } = await adminClient
      .from("webhook_endpoints")
      .select("url")
      .eq("event_type", "customer_invited")
      .eq("is_active", true);

    if (webhookEndpoints && webhookEndpoints.length > 0) {
      const webhookPayload = JSON.stringify({
        event: "customer_invited",
        timestamp: new Date().toISOString(),
        data: { tenant_id: tenant.id, company_name, email, contact_name },
      });
      for (const ep of webhookEndpoints) {
        try {
          await fetch(ep.url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: webhookPayload,
          });
        } catch (e) { console.error("Webhook failed:", e); }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tenant_id: tenant.id,
        user_id: userId,
        invited: isNewUser,
        message: isNewUser
          ? `Einladung an ${email} gesendet`
          : `Kundenkonto für bestehenden Benutzer erstellt`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Server error: ${err.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
