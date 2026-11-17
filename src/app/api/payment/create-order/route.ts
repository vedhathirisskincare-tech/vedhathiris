import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const runtime = 'nodejs';

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || '';

  if (!key_id || !key_secret) {
    throw new Error('Razorpay API keys (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) are missing in environment variables.');
  }

  return {
    instance: new Razorpay({ key_id, key_secret }),
    keyId: key_id,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid amount' }, { status: 400 });
    }

    const { instance, keyId } = getRazorpayInstance();
    const safeAmount = Math.max(1, amount);

    const options = {
      amount: Math.round(safeAmount * 100), // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await instance.orders.create(options);
    return NextResponse.json({ success: true, order, keyId });
  } catch (error: any) {
    console.error('Error creating Razorpay order via API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

