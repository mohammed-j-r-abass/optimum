# Third-party notices

The root MIT licence covers original project contributions. It does not replace
the licences of installed dependencies, copied third-party components, provider
SDKs, fonts, services or trademarks.

## shadcn/ui components

The app contains UI components derived from shadcn/ui.
Source and licence: https://github.com/shadcn-ui/ui/blob/main/LICENSE.md

> MIT License
>
> Copyright (c) 2023 shadcn
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all
> copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
> SOFTWARE.

## Package dependencies

Dependency versions are recorded in `pnpm-lock.yaml`. Their copyright and licence
notices remain with the respective packages. Retain relevant notices when
redistributing dependencies or production bundles.

Notable dependencies include React, Vite, TypeScript, Express, Drizzle,
PostgreSQL clients, Clerk, the Google Gen AI SDK, the OpenAI SDK, Radix UI,
Lucide, React PDF and the slide viewer's chart/rendering packages.
This is an inventory aid, not a claim that every package uses MIT.

Installed metadata also includes MPL-2.0 packages (Lightning CSS),
CC-BY-4.0 data (`caniuse-lite`), and dual-licensed packages. These are not
relicensed by the root MIT file.

Some Replit-specific development packages do not declare a licence in their
installed package metadata. Their absence from the source snapshot's vendored
files is intentional: package dependencies are installed separately. Check
upstream terms before redistributing their package contents or claiming that
an entire dependency bundle is MIT-licensed. Missing metadata alone is not a
determination of permission or prohibition.

## External services and fonts

Google/Gemini, OpenAI-compatible providers, Clerk and Replit services are subject
to their respective service terms and account requirements. This repository
does not provide credentials, service access or a trademark licence.

The pitch references Google Fonts (Inter and DM Mono); those font files are
not bundled in the source snapshot. If self-hosting or distributing fonts,
obtain the files and retain their applicable font licences. The public snapshot
does not include proprietary Times New Roman font files.
