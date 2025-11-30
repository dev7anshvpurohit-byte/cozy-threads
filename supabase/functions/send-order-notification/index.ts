import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderNotificationRequest {
  orderIds: number[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  items: {
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  orderDate: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const orderData: OrderNotificationRequest = await req.json();
    console.log("Received order notification request:", orderData);

    // Fetch admin emails from admins table
    const { data: admins, error: adminError } = await supabase
      .from("admins")
      .select("email");

    if (adminError) {
      console.error("Error fetching admins:", adminError);
      throw new Error("Failed to fetch admin emails");
    }

    if (!admins || admins.length === 0) {
      console.log("No admins found, skipping email notification");
      return new Response(
        JSON.stringify({ message: "No admins to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminEmails = admins.map((admin) => admin.email);
    console.log("Sending notification to admins:", adminEmails);

    // Build items HTML
    const itemsHtml = orderData.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.productName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.size}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString("en-IN")}</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Order Notification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🧥 New Order Received!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Under the Hoodies</p>
        </div>
        
        <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none;">
          <h2 style="color: #8B4513; margin-top: 0;">Order Details</h2>
          <table style="width: 100%; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Order ID(s):</td>
              <td style="padding: 8px 0; font-weight: bold;">${orderData.orderIds.join(", ")}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Order Date:</td>
              <td style="padding: 8px 0;">${new Date(orderData.orderDate).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" })}</td>
            </tr>
          </table>

          <h2 style="color: #8B4513;">Customer Information</h2>
          <table style="width: 100%; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Name:</td>
              <td style="padding: 8px 0; font-weight: bold;">${orderData.customerName || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${orderData.customerEmail}" style="color: #8B4513;">${orderData.customerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Phone:</td>
              <td style="padding: 8px 0;">${orderData.customerPhone || "Not provided"}</td>
            </tr>
          </table>

          <h2 style="color: #8B4513;">Shipping Address</h2>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            ${orderData.address}<br>
            ${orderData.city}, ${orderData.state} - ${orderData.postalCode}<br>
            ${orderData.country}
          </p>

          <h2 style="color: #8B4513;">Ordered Items</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #8B4513;">Product</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #8B4513;">Size</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #8B4513;">Qty</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #8B4513;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); color: white; padding: 20px; border-radius: 5px; text-align: right;">
            <span style="font-size: 18px;">Total Amount: </span>
            <span style="font-size: 24px; font-weight: bold;">₹${orderData.totalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #666; font-size: 12px;">
          <p style="margin: 0;">This is an automated notification from Under the Hoodies</p>
        </div>
      </body>
      </html>
    `;

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Under the Hoodies <onboarding@resend.dev>",
      to: adminEmails,
      subject: `🧥 New Order #${orderData.orderIds[0]} - ₹${orderData.totalAmount.toLocaleString("en-IN")}`,
      html: emailHtml,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      throw emailError;
    }

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ success: true, emailId: emailData?.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-order-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
