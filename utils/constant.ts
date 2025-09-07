import { isDev } from "@/lib/helpers";

export const plans = [
    {
        id: "basic",
        name: "Basic",
        price: 9,
        description: "Perfect for occasional use",
        items: [
            "5 PDF summaries per month",
            "Standard processing speed",
            "Email support",
        ],
        paymentLink:
            isDev
                ? "https://buy.stripe.com/test_fZu9AM4q28H24yp6VxaVa00"
                : "",
        priceId:
            isDev
                ? "price_1S4otk2F8k2IcSji1AMMNLYl"
                : "",
    },
    {
        id: "pro",
        name: "Pro",
        price: 19,
        description: "For professionals and teams",
        items: [
            "Unlimited PDF summaries",
            "Priority processing",
            "24/7 priority support",
            "Markdown Export",
        ],
        paymentLink:
            isDev
                ? "https://buy.stripe.com/test_00w9AM6yag9uaWNgw7aVa01"
                : "",
        priceId:
            isDev
                ? "price_1S4otk2F8k2IcSjiqCnxeVuG"
                : "",
    },
];