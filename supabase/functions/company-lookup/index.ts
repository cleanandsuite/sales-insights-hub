import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { companyName, city, state, confirmed } = body;

    if (!companyName || typeof companyName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Company name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanCompanyName = companyName.trim().substring(0, 100);
    console.log('Looking up company:', cleanCompanyName, { city, state, confirmed });

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      console.error("GROQ_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: 'Service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If confirmed selection, do detailed research
    if (confirmed && city && state) {
      const researchPrompt = `Research the company "${cleanCompanyName}" located in ${city}, ${state}.

Provide detailed information in the following JSON format:
{
  "name": "Official company name",
  "description": "Brief company description (1-2 sentences)",
  "industry": "Primary industry",
  "size": "Company size (e.g., 'Startup (1-50)', 'SMB (51-200)', 'Mid-Market (201-1000)', 'Enterprise (1000+)')",
  "city": "${city}",
  "state": "${state}",
  "country": "Country",
  "website": "Company website URL",
  "recentNews": ["Recent news item 1", "Recent news item 2"],
  "painPoints": ["Likely business pain point 1", "Pain point 2", "Pain point 3"],
  "competitors": ["Competitor 1", "Competitor 2"],
  "techStack": ["Known technology 1", "Technology 2"]
}

Focus on information useful for a B2B sales conversation. If information is not available, use reasonable inferences based on the industry and company size.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { 
              role: "system", 
              content: "You are a business research assistant. Provide accurate, concise company information in valid JSON format. Focus on information useful for B2B sales conversations." 
            },
            { role: "user", content: researchPrompt }
          ],
        }),
      });

      if (!response.ok) {
        console.error("AI gateway error:", response.status);
        return new Response(
          JSON.stringify({ status: 'not_found', message: 'Failed to research company' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const research = JSON.parse(jsonMatch[0]);
          return new Response(
            JSON.stringify({ status: 'found', research }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (parseError) {
        console.error("Failed to parse research response:", parseError);
      }

      return new Response(
        JSON.stringify({ status: 'not_found', message: 'Failed to parse company research' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initial lookup - check for company matches
    const lookupPrompt = `Search for companies matching the name "${cleanCompanyName}".

If you find exactly one well-known company with this name, return:
{
  "status": "single",
  "company": {
    "name": "Official company name",
    "description": "Brief company description",
    "industry": "Primary industry",
    "size": "Company size category",
    "city": "Headquarters city",
    "state": "Headquarters state/province",
    "country": "Country",
    "website": "Company website"
  }
}

If you find multiple companies or locations with this name, return:
{
  "status": "multiple",
  "matches": [
    {
      "name": "Company Name 1",
      "city": "City",
      "state": "State",
      "country": "Country",
      "industry": "Industry"
    },
    {
      "name": "Company Name 2",
      "city": "City",
      "state": "State",
      "country": "Country",
      "industry": "Industry"
    }
  ]
}

If no companies match or it's too generic, return:
{
  "status": "not_found",
  "message": "No matching companies found"
}

Only return the JSON, no additional text.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "You are a business directory assistant. Help identify companies by name. Always respond with valid JSON only." 
          },
          { role: "user", content: lookupPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      return new Response(
        JSON.stringify({ status: 'not_found', message: 'Lookup failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ status: 'not_found', message: 'No response from AI' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        if (result.status === 'single' && result.company) {
          // Single match - do full research
          const researchPrompt = `Research the company "${result.company.name}" in detail for a B2B sales context.

Provide comprehensive information in JSON format:
{
  "name": "${result.company.name}",
  "description": "Detailed company description (2-3 sentences)",
  "industry": "${result.company.industry || 'Unknown'}",
  "size": "${result.company.size || 'Unknown'}",
  "city": "${result.company.city || ''}",
  "state": "${result.company.state || ''}",
  "country": "${result.company.country || ''}",
  "website": "${result.company.website || ''}",
  "recentNews": ["Recent relevant news 1", "News 2"],
  "painPoints": ["Likely business challenge 1", "Challenge 2", "Challenge 3"],
  "competitors": ["Main competitor 1", "Competitor 2"],
  "techStack": ["Known technology 1", "Technology 2"]
}`;

          const researchResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GROQ_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                { 
                  role: "system", 
                  content: "You are a business research assistant. Provide detailed company information for B2B sales preparation. Always respond with valid JSON." 
                },
                { role: "user", content: researchPrompt }
              ],
            }),
          });

          if (researchResponse.ok) {
            const researchData = await researchResponse.json();
            const researchContent = researchData.choices?.[0]?.message?.content;
            
            try {
              const researchJsonMatch = researchContent.match(/\{[\s\S]*\}/);
              if (researchJsonMatch) {
                const research = JSON.parse(researchJsonMatch[0]);
                return new Response(
                  JSON.stringify({ status: 'found', research }),
                  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
              }
            } catch (e) {
              console.error("Failed to parse detailed research:", e);
            }
          }

          // Fallback to basic info
          return new Response(
            JSON.stringify({ status: 'found', research: result.company }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (result.status === 'multiple' && result.matches) {
          return new Response(
            JSON.stringify({ status: 'multiple', matches: result.matches.slice(0, 5) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ status: 'not_found', message: result.message || 'Company not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError) {
      console.error("Failed to parse lookup response:", parseError);
    }

    return new Response(
      JSON.stringify({ status: 'not_found', message: 'Failed to process lookup' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in company-lookup:", error);
    return new Response(
      JSON.stringify({ status: 'not_found', message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
