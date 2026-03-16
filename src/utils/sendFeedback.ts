import emailjs from "@emailjs/browser";

interface FeedbackData {
  rating: number;
  liked: string;
  improve: string;
  email: string;
}

export const sendFeedback = async (data: FeedbackData): Promise<void> => {
  const serviceId = "default_service";
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!templateId || !publicKey) {
    console.warn("EmailJS env vars not set");
    // Still resolve so UI shows success during dev
    return;
  }

  await emailjs.send(
    serviceId,
    templateId,
    {
      rating: String(data.rating),
      liked: data.liked,
      improve: data.improve,
      email: data.email || "Not provided",
      time: new Date().toLocaleString(),
    },
    publicKey
  );
};
