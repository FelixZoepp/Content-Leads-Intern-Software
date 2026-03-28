
-- Delete all related data for Dotti GmbH (tenant_id: 2d6bc22f-4a21-4046-830c-99acbba24762)
DELETE FROM icp_customers WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM metrics_snapshot WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM financial_tracking WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM fulfillment_tracking WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM health_scores WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM ai_summaries WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM alerts WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM benchmarks WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM csat_responses WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM survey_responses WHERE tenant_id = '2d6bc22f-4a21-4046-830c-99acbba24762';
DELETE FROM profiles WHERE user_id = '91d24dcf-8b80-4715-96a2-3f0146f9bdea';
DELETE FROM user_roles WHERE user_id = '91d24dcf-8b80-4715-96a2-3f0146f9bdea';
DELETE FROM tenants WHERE id = '2d6bc22f-4a21-4046-830c-99acbba24762';
