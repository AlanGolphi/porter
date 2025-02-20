<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://porter.wuds.run">
    <img src="https://pandora.wuds.run/images/250219-ik_93OwGIA.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Porter</h3>

  <p align="center">
    Port your files to cloudflare r2.➡️
  <a href="https://porter.wuds.run">View Demo</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>📑 Table of Contents</summary>
  
- [About The Project](#about-the-project)
  - [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisite](#prerequisite)
  - [Run locally](#run-locally)
- [License](#license)
- [Acknowledgments](#acknowledgments)
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
email: `test@test.com`  
password: `123123123`
[![Product Name Screen Shot][product-screenshot0]](https://porter.wuds.run)
[![Product Name Screen Shot][product-screenshot1]](https://porter.wuds.run)

**Porter** is a modern full-stack application built with Next.js 15. This learn-by-doing project demonstrates the implementation of a cloud storage solution using Cloudflare R2.

Key features:
- Built with Next.js 15 and TypeScript following industry best practices
- Seamless file upload and management with Cloudflare R2 integration
- Modern UI/UX with responsive design
- Robust error handling and performance optimization
- Comprehensive TypeScript implementation
- Email/password authentication with JWTs stored to cookies

This project serves as both a practical learning exercise and a production-ready solution for cloud storage needs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [shadcn/ui](https://ui.shadcn.com/)
- **Style**: [Tailwindcss](https://v3.tailwindcss.com/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Outh**: [Jose](https://github.com/panva/jose/)
- **Object Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/products/r2/)
- **Email Service**: [Resend](https://resend.com/)
- **i18n**: [next-intl](https://next-intl.dev/)
- **Analytics**: [Umami](https://umami.is/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisite
* nodejs 18+
* npm
* postgres database
* cloudflare r2 bucket
* resend private key
* _umami script url and website id (optional)_

### Run locally

1. Clone the repo
   ```bash
   mkdir porter && cd porter
   git clone https://github.com/AlanGolphi/porter.git .
   ```
2. Install packages
   ```bash
   # using --legacy-peer-deps flag for react19
   # see https://nextjs.org/docs/app/building-your-application/upgrading/version-15
   npm install --legacy-peer-deps
   ```
3. Prepare environment variables
   - copy `env.example` to `.env`
   - fill your own variables
4. Run it
   ```bash
    npm run dev
   ```
   Open [http://localhost:8899](http://localhost:8899) in your browser and good to go.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

explain all the environments here

1. `NODE_ENV`: Distinguish the current env, enum `development` `test` `production`
2. `DATABASE_URL`: PostgreSQL database connection URL, format: `postgresql://user:password@host:port/database`
3. `JWT_SECRET`: Secret key for JWT token generation and verification, you can generate with `openssl rand -base64 32`
4. `CLOUDFLARE_R2_ACCOUNT_ID`: Your Cloudflare account ID, found in R2 dashboard
5. `CLOUDFLARE_R2_TOKEN`: API token for Cloudflare R2 access, generated from Cloudflare dashboard
6. `CLOUDFLARE_R2_ACCESS_ID`: Access key ID for R2 bucket authentication
7. `CLOUDFLARE_R2_SECRET_KEY`: Secret access key for R2 bucket authentication
8. `NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET`: Name of your R2 bucket
9. `NEXT_PUBLIC_CLOUDFLARE_R2_DOMAIN`: Custom domain for your R2 bucket (optional)
10. `NEXT_PUBLIC_CLOUDFLARE_R2_ENDPOINT`: R2 endpoint URL, format: `https://<account-id>.r2.cloudflarestorage.com`
11. `NEXT_PUBLIC_SITE_URL`: Your application's public URL, e.g., `https://porter.wuds.run`
12. `RESEND_PRIVATE_KEY`: API key for Resend email service
13. `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: URL to your Umami analytics script (optional)
14. `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Website ID for Umami analytics tracking (optional)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
[product-screenshot0]:https://pandora.wuds.run/images/250219-y-mh7aKTR0.png
[product-screenshot1]: https://pandora.wuds.run/images/250219-_hEx9OA3XP.png