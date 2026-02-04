import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { username } = await req.json();
    
    if (!username || typeof username !== 'string') {
      return new Response(
        JSON.stringify({ isAppropriate: false, reason: "Username is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Basic validation
    if (username.length < 3) {
      return new Response(
        JSON.stringify({ isAppropriate: false, reason: "Username must be at least 3 characters" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (username.length > 20) {
      return new Response(
        JSON.stringify({ isAppropriate: false, reason: "Username must be 20 characters or less" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      // Fall back to basic check if AI not available
      return new Response(
        JSON.stringify({ isAppropriate: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking username:", username);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: `You are a content moderation system for a chess game platform. Your job is to determine if a username is appropriate.

A username is INAPPROPRIATE if it contains:
- Hate speech, slurs, or discriminatory language
- Profanity or vulgar words (including creative spellings like replacing letters with numbers)
- Sexual or explicit content
- Threats or violent language
- Personal attacks or harassment
- Impersonation of staff/admin roles

A username is APPROPRIATE if it:
- Is a normal gaming username
- Contains numbers, underscores, or creative spellings that aren't offensive
- References chess pieces, strategies, or gaming terms
- Is a name, nickname, or creative handle

Respond ONLY with a JSON object in this exact format:
{"appropriate": true} or {"appropriate": false, "reason": "brief explanation"}`
          },
          {
            role: "user",
            content: `Is this username appropriate for a chess platform? Username: "${username}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ isAppropriate: true, warning: "Rate limited, skipping AI check" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      // Fall back to allowing if AI check fails
      return new Response(
        JSON.stringify({ isAppropriate: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    console.log("AI response:", content);

    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return new Response(
          JSON.stringify({ 
            isAppropriate: result.appropriate === true,
            reason: result.reason || undefined
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
    }

    // Default to allowing if parsing fails
    return new Response(
      JSON.stringify({ isAppropriate: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Moderation error:", error);
    return new Response(
      JSON.stringify({ isAppropriate: true, error: "Moderation check failed" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  }
});
