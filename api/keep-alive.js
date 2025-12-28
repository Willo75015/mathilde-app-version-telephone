/**
 * Keep-Alive Cron Job pour Supabase
 *
 * Ce endpoint est appelé automatiquement par Vercel Cron toutes les 12h
 * pour empêcher Supabase de mettre le projet en pause (limitation Free Tier)
 */

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({
      error: 'Supabase credentials not configured',
      timestamp: new Date().toISOString()
    })
  }

  try {
    // Ping la base de données avec une simple requête
    const response = await fetch(`${supabaseUrl}/rest/v1/clients?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })

    const status = response.status
    const timestamp = new Date().toISOString()

    if (response.ok) {
      console.log(`[KEEP-ALIVE] Supabase ping successful at ${timestamp}`)
      return res.status(200).json({
        success: true,
        message: 'Supabase is alive',
        supabaseStatus: status,
        timestamp
      })
    } else {
      console.error(`[KEEP-ALIVE] Supabase ping failed with status ${status}`)
      return res.status(response.status).json({
        success: false,
        message: 'Supabase ping failed',
        supabaseStatus: status,
        timestamp
      })
    }
  } catch (error) {
    console.error('[KEEP-ALIVE] Error:', error.message)
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
}
