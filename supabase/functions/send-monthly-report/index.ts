import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TaksasiData {
  id: string;
  tanggal: string;
  nomor_dokumen: string;
  nama_debitur: string;
  jenis_agunan: string;
  nilai_taksasi: number;
  nilai_likuidasi: number;
  status: string;
  kantor_cabang: string;
}

// Format currency helper
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Format date helper
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

// Get month name in Indonesian
const getMonthName = (date: Date): string => {
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

// Generate HTML email body
const generateEmailHTML = (
  data: TaksasiData[],
  summary: {
    total: number;
    totalTaksasi: number;
    totalLikuidasi: number;
    byJenis: { tanah: number; tanahBangunan: number; kendaraan: number };
    byStatus: { selesai: number; draft: number };
  },
  periodStart: Date,
  periodEnd: Date
): string => {
  const periodLabel = `${formatDate(periodStart.toISOString())} - ${formatDate(periodEnd.toISOString())}`;
  
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Laporan Rekap Taksasi Bulanan</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0 0 10px 0; font-size: 24px; }
        .header p { margin: 0; opacity: 0.9; font-size: 14px; }
        .content { padding: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px; }
        .summary-card { background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6; }
        .summary-card.success { border-left-color: #10b981; }
        .summary-card.warning { border-left-color: #f59e0b; }
        .summary-card.info { border-left-color: #6366f1; }
        .summary-card h3 { margin: 0 0 5px 0; font-size: 12px; color: #64748b; text-transform: uppercase; }
        .summary-card p { margin: 0; font-size: 20px; font-weight: bold; color: #1e293b; }
        .breakdown { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .breakdown h3 { margin: 0 0 15px 0; color: #1e293b; font-size: 16px; }
        .breakdown-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .breakdown-item { text-align: center; padding: 15px; background: white; border-radius: 6px; }
        .breakdown-item .icon { font-size: 24px; margin-bottom: 5px; }
        .breakdown-item .label { font-size: 12px; color: #64748b; }
        .breakdown-item .value { font-size: 18px; font-weight: bold; color: #1e293b; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f1f5f9; padding: 12px 8px; text-align: left; font-weight: 600; color: #475569; border-bottom: 2px solid #e2e8f0; }
        td { padding: 12px 8px; border-bottom: 1px solid #e2e8f0; color: #334155; }
        tr:hover { background: #f8fafc; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .status.selesai { background: #dcfce7; color: #166534; }
        .status.draft { background: #fef3c7; color: #92400e; }
        .footer { background: #f8fafc; padding: 20px 30px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }
        .no-data { text-align: center; padding: 40px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Laporan Rekap Taksasi Bulanan</h1>
          <p>Periode: ${periodLabel}</p>
        </div>
        
        <div class="content">
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total Taksasi</h3>
              <p>${summary.total} Data</p>
            </div>
            <div class="summary-card success">
              <h3>Selesai</h3>
              <p>${summary.byStatus.selesai} Data</p>
            </div>
            <div class="summary-card info">
              <h3>Nilai Taksasi</h3>
              <p>${formatCurrency(summary.totalTaksasi)}</p>
            </div>
            <div class="summary-card warning">
              <h3>Nilai Likuidasi</h3>
              <p>${formatCurrency(summary.totalLikuidasi)}</p>
            </div>
          </div>

          <div class="breakdown">
            <h3>📁 Breakdown per Jenis Agunan</h3>
            <div class="breakdown-grid">
              <div class="breakdown-item">
                <div class="icon">🏠</div>
                <div class="value">${summary.byJenis.tanah}</div>
                <div class="label">Tanah</div>
              </div>
              <div class="breakdown-item">
                <div class="icon">🏢</div>
                <div class="value">${summary.byJenis.tanahBangunan}</div>
                <div class="label">Tanah & Bangunan</div>
              </div>
              <div class="breakdown-item">
                <div class="icon">🚗</div>
                <div class="value">${summary.byJenis.kendaraan}</div>
                <div class="label">Kendaraan</div>
              </div>
            </div>
          </div>

          ${data.length > 0 ? `
            <h3 style="margin-bottom: 15px; color: #1e293b;">📋 Detail Taksasi</h3>
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>No. Dokumen</th>
                  <th>Debitur</th>
                  <th>Jenis</th>
                  <th>Nilai Taksasi</th>
                  <th>Nilai Likuidasi</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr>
                    <td>${formatDate(item.tanggal)}</td>
                    <td style="font-family: monospace; font-size: 11px;">${item.nomor_dokumen}</td>
                    <td>${item.nama_debitur}</td>
                    <td>${item.jenis_agunan}</td>
                    <td style="font-weight: 500;">${formatCurrency(item.nilai_taksasi || 0)}</td>
                    <td style="color: #059669;">${formatCurrency(item.nilai_likuidasi || 0)}</td>
                    <td><span class="status ${item.status}">${item.status === 'disetujui' ? 'Selesai' : 'Draft'}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : `
            <div class="no-data">
              <p>📭 Tidak ada data taksasi pada periode ini.</p>
            </div>
          `}
        </div>

        <div class="footer">
          <p>Laporan ini dikirim secara otomatis oleh sistem SITAKSI.</p>
          <p>Bank Kaltimtara - Sistem Informasi Taksasi Agunan</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate date range for last month
    const now = new Date();
    const periodEnd = new Date(now.getFullYear(), now.getMonth(), 0); // Last day of previous month
    const periodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); // First day of previous month
    
    // For manual trigger, allow custom date range
    let customStart: Date | null = null;
    let customEnd: Date | null = null;
    
    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.startDate) customStart = new Date(body.startDate);
        if (body.endDate) customEnd = new Date(body.endDate);
      } catch {
        // No body or invalid JSON, use default dates
      }
    }
    
    const startDate = customStart || periodStart;
    const endDate = customEnd || periodEnd;

    console.log(`Generating report for period: ${startDate.toISOString()} - ${endDate.toISOString()}`);

    // Fetch taksasi data for the period
    const { data: taksasiData, error: taksasiError } = await supabase
      .from('taksasi')
      .select('id, tanggal, nomor_dokumen, nama_debitur, jenis_agunan, nilai_taksasi, nilai_likuidasi, status, kantor_cabang')
      .gte('tanggal', startDate.toISOString().split('T')[0])
      .lte('tanggal', endDate.toISOString().split('T')[0])
      .order('tanggal', { ascending: false });

    if (taksasiError) {
      console.error('Error fetching taksasi:', taksasiError);
      throw new Error(`Failed to fetch taksasi data: ${taksasiError.message}`);
    }

    const data = taksasiData as TaksasiData[] || [];
    console.log(`Found ${data.length} taksasi records`);

    // Calculate summary
    const summary = {
      total: data.length,
      totalTaksasi: data.reduce((acc, t) => acc + (t.nilai_taksasi || 0), 0),
      totalLikuidasi: data.reduce((acc, t) => acc + (t.nilai_likuidasi || 0), 0),
      byJenis: {
        tanah: data.filter(t => t.jenis_agunan === 'Tanah').length,
        tanahBangunan: data.filter(t => t.jenis_agunan === 'Tanah & Bangunan').length,
        kendaraan: data.filter(t => t.jenis_agunan === 'Kendaraan').length,
      },
      byStatus: {
        selesai: data.filter(t => t.status === 'disetujui').length,
        draft: data.filter(t => t.status === 'draft').length,
      }
    };

    // Fetch admin emails from profiles where role is Admin
    const { data: adminProfiles, error: profileError } = await supabase
      .from('profiles')
      .select('email, nama')
      .eq('role', 'Admin')
      .eq('is_approved', true);

    if (profileError) {
      console.error('Error fetching admin profiles:', profileError);
      throw new Error(`Failed to fetch admin profiles: ${profileError.message}`);
    }

    if (!adminProfiles || adminProfiles.length === 0) {
      console.log('No admin emails found');
      return new Response(
        JSON.stringify({ success: false, message: 'No admin emails found' }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const adminEmails = adminProfiles.map(p => p.email);
    console.log(`Sending report to ${adminEmails.length} admin(s): ${adminEmails.join(', ')}`);

    // Generate email HTML
    const emailHTML = generateEmailHTML(data, summary, startDate, endDate);

    // Send email
    const emailResponse = await resend.emails.send({
      from: "SITAKSI Report <onboarding@resend.dev>",
      to: adminEmails,
      subject: `📊 Laporan Rekap Taksasi - ${getMonthName(startDate)}`,
      html: emailHTML,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Report sent to ${adminEmails.length} admin(s)`,
        emailIds: emailResponse,
        summary,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
        },
        recipientCount: adminEmails.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-monthly-report:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
