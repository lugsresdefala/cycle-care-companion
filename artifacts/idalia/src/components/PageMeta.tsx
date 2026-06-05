import { Helmet } from "react-helmet-async";

const SITE_NAME = "IDALIA Calc";
const BASE_URL = "https://idcalc.com";
const OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/ufQK6LGtuvVSYYkWQadeh2DIPSD3/social-images/social-1776829286751-w_XTP9uyjaadOYsH_(1).webp";

interface PageMetaProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

export function PageMeta({ title, description, path, ogImage = OG_IMAGE }: PageMetaProps) {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
