import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenantId } = await req.json();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get tenant's sheet URL and mapping
    const { data: tenant, error: tenantError } = await supabaseClient
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single();

    if (tenantError) throw tenantError;
    if (!tenant.sheet_url) throw new Error("No sheet URL configured");

    // Extract Google Sheets ID from URL
    const sheetIdMatch = tenant.sheet_url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) throw new Error("Invalid Google Sheets URL");
    const sheetId = sheetIdMatch[1];

    // Construct CSV export URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    // Fetch CSV data
    const csvResponse = await fetch(csvUrl);
    if (!csvResponse.ok) {
      throw new Error(`Failed to fetch sheet: ${csvResponse.statusText}`);
    }

    const csvText = await csvResponse.text();
    console.log("CSV text length:", csvText.length);
    console.log("CSV first 500 chars:", csvText.substring(0, 500));
    
    // Parse CSV properly (handle quoted fields)
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log("Total lines found:", lines.length);
    
    if (lines.length < 2) {
      throw new Error(`Sheet is empty or has no data rows. Found ${lines.length} lines.`);
    }
    
    // Simple CSV parser that handles basic quoted fields
    const parseCSVLine = (line: string): string[] => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };
    
    const rows = lines.map(line => parseCSVLine(line));

    const headers = rows[0].map(h => h.trim().toLowerCase());
    const mapping = tenant.sheet_mapping || {};

    // Default mapping if not configured
    const columnMap = {
      date: mapping.date || headers.indexOf('datum'),
      posts: mapping.posts || headers.indexOf('posts'),
      impressions: mapping.impressions || headers.indexOf('impressions'),
      likes: mapping.likes || headers.indexOf('likes'),
      comments: mapping.comments || headers.indexOf('kommentare'),
      new_followers: mapping.new_followers || headers.indexOf('neue_follower'),
      leads_total: mapping.leads_total || headers.indexOf('leads_total'),
      leads_qualified: mapping.leads_qualified || headers.indexOf('leads_qualifiziert'),
      appointments: mapping.appointments || headers.indexOf('termine'),
      deals: mapping.deals || headers.indexOf('deals'),
      revenue: mapping.revenue || headers.indexOf('umsatz'),
    };

    // Parse data rows (skip header)
    const metricsToInsert = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 2) continue; // Skip empty rows

      try {
        const dateStr = row[columnMap.date]?.trim();
        if (!dateStr) continue;

        // Parse date (format: DD.MM.YYYY or YYYY-MM-DD)
        let periodDate: Date;
        if (dateStr.includes('.')) {
          const [day, month, year] = dateStr.split('.');
          periodDate = new Date(`${year}-${month}-${day}`);
        } else {
          periodDate = new Date(dateStr);
        }

        if (isNaN(periodDate.getTime())) continue;

        const metric = {
          tenant_id: tenantId,
          period_date: periodDate.toISOString().split('T')[0],
          period_type: 'daily',
          posts: parseInt(row[columnMap.posts]) || 0,
          impressions: parseInt(row[columnMap.impressions]) || 0,
          likes: parseInt(row[columnMap.likes]) || 0,
          comments: parseInt(row[columnMap.comments]) || 0,
          new_followers: parseInt(row[columnMap.new_followers]) || 0,
          leads_total: parseInt(row[columnMap.leads_total]) || 0,
          leads_qualified: parseInt(row[columnMap.leads_qualified]) || 0,
          appointments: parseInt(row[columnMap.appointments]) || 0,
          deals: parseInt(row[columnMap.deals]) || 0,
          revenue: parseFloat(row[columnMap.revenue]?.replace(',', '.')) || 0,
        };

        metricsToInsert.push(metric);
      } catch (error) {
        console.error(`Error parsing row ${i}:`, error);
        continue;
      }
    }

    if (metricsToInsert.length === 0) {
      throw new Error("No valid data rows found in sheet");
    }

    // Upsert metrics (update if exists, insert if not)
    const { error: metricsError } = await supabaseClient
      .from("metrics_snapshot")
      .upsert(metricsToInsert, { onConflict: 'tenant_id,period_date,period_type' });

    if (metricsError) throw metricsError;

    // Update last sync time
    await supabaseClient
      .from("tenants")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", tenantId);

    return new Response(JSON.stringify({ 
      success: true, 
      rowsProcessed: metricsToInsert.length 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error syncing sheet:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
