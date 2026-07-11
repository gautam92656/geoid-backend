import type { PrismaClient } from "../../src/generated/prisma/client"

const FAQS = [
  {
    id: 1,
    question: "How do I get started?",
    answer: "Sign up with your email, verify the OTP sent to your inbox, then log in to access the API.",
  },
  {
    id: 2,
    question: "How do I reset my password?",
    answer: "Use the forgot-password endpoint to receive an OTP, then call reset-password with your new password.",
  },
]

export async function seedFaqs(prisma: PrismaClient) {
  for (const { id, ...data } of FAQS) {
    await prisma.faq.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    })
  }

  console.log(`Seeded ${FAQS.length} FAQ(s)`)
}
