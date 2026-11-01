This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Production-safe configuration

For a hosted deployment, do not point Antseed to `127.0.0.1` or `localhost`. Those addresses are machine-local and will not work from Vercel or any other machine.

Use a reachable Antseed base URL instead:

```env
ANTSEED_BASE_URL="https://your-antseed-host.example.com"
ANTSEED_API_KEY="your-antseed-api-key"
ANTSEED_DEFAULT_MODEL="antseed-gpt-4.1-mini"
```

Also, do not deploy this app with the default SQLite file database from local development. Vercel serverless environments should use a remote Postgres database:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

Use the same pattern in Vercel project settings under Environment Variables.
