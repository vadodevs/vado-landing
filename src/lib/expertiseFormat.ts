/**
 * Normaliza etiquetas de expertise para mostrar un formato consistente:
 * nombres conocidos (p. ej. JavaScript, C++) y, si no hay coincidencia, capitalización tipo título.
 */

/** Claves en minúsculas; entrada se compara tras trim + espacios colapsados + toLowerCase. */
const CANONICAL: Record<string, string> = {
  // Lenguajes y runtimes
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  kotlin: 'Kotlin',
  swift: 'Swift',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  csharp: 'C#',
  'c#': 'C#',
  'c++': 'C++',
  cpp: 'C++',
  scala: 'Scala',
  elixir: 'Elixir',
  dart: 'Dart',
  r: 'R',
  // Web / markup
  html: 'HTML',
  css: 'CSS',
  sass: 'Sass',
  scss: 'SCSS',
  // Frameworks / libs
  react: 'React',
  vue: 'Vue',
  'vue.js': 'Vue.js',
  angular: 'Angular',
  svelte: 'Svelte',
  next: 'Next.js',
  'next.js': 'Next.js',
  nuxt: 'Nuxt',
  express: 'Express',
  nest: 'NestJS',
  nestjs: 'NestJS',
  django: 'Django',
  flask: 'Flask',
  fastapi: 'FastAPI',
  spring: 'Spring',
  laravel: 'Laravel',
  rails: 'Rails',
  'ruby on rails': 'Ruby on Rails',
  // Node
  node: 'Node.js',
  'node.js': 'Node.js',
  npm: 'npm',
  yarn: 'Yarn',
  pnpm: 'pnpm',
  bun: 'Bun',
  // Datos / infra
  sql: 'SQL',
  mysql: 'MySQL',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
  graphql: 'GraphQL',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  gcp: 'GCP',
  azure: 'Azure',
  terraform: 'Terraform',
  ansible: 'Ansible',
  jenkins: 'Jenkins',
  git: 'Git',
  github: 'GitHub',
  gitlab: 'GitLab',
  // Siglas frecuentes
  api: 'API',
  rest: 'REST',
  grpc: 'gRPC',
  oauth: 'OAuth',
  jwt: 'JWT',
  cicd: 'CI/CD',
  // Frases comunes
  'react native': 'React Native',
  'spring boot': 'Spring Boot',
  'tailwind css': 'Tailwind CSS',
  tailwind: 'Tailwind CSS',
  'vue js': 'Vue.js',
  'next js': 'Next.js',
  'node js': 'Node.js',
  'machine learning': 'Machine Learning',
  'deep learning': 'Deep Learning',
};

function titleCaseWord(word: string): string {
  const lower = word.toLowerCase();
  if (CANONICAL[lower]) return CANONICAL[lower];

  // Solo números o símbolos (p. ej. "++", "3.0")
  if (!/[a-zA-Z]/.test(word)) {
    return word;
  }

  // Primera letra mayúscula, resto minúsculas (corrige javasScript → Javascript)
  const first = word.search(/[a-zA-Z]/);
  if (first === -1) return word;
  return (
    word.slice(0, first) +
    word.charAt(first).toUpperCase() +
    word.slice(first + 1).toLowerCase()
  );
}

/**
 * Devuelve la etiqueta formateada o cadena vacía si no queda contenido útil.
 */
export function normalizeExpertiseTag(raw: string): string {
  const collapsed = raw.trim().replace(/\s+/g, ' ');
  if (!collapsed) return '';

  const fullKey = collapsed.toLowerCase();
  if (CANONICAL[fullKey]) return CANONICAL[fullKey];

  return collapsed
    .split(' ')
    .map((word) => titleCaseWord(word))
    .join(' ');
}
