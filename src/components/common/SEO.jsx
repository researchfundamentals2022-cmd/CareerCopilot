import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Career Copilot | AI-Powered Resume Builder for Students", 
  description = "Build a professional, ATS-optimized resume in minutes with Career Copilot. Designed for students and freshers to kickstart their career.",
  path = "",
  image = "https://www.careercopilot.cognisysai.com/career_copilot_logo.png"
}) => {
  const domain = "https://www.careercopilot.cognisysai.com";
  const url = `${domain}${path}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="career copilot, carer copilot, copilot career, carer pilot, career pilot, AI resume builder, resume builder for students, ATS resume maker, free resume builder, career co pilot, careerpilot" />
      <meta name="author" content="Cognisys AI" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content="Career Copilot" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
