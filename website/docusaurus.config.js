module.exports = {
  title: 'Docusaurus Terminology',
  tagline: 'Create a terminology structure in your Docusaurus project',
  url: 'https://devs.pages.grnet.gr/docusaurus-terminology',
  baseUrl: process.env.STAGING && process.env.STAGING === 'true' ? '/docusaurus-terminology/' : '/',
  onBrokenLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'facebook', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'Docusaurus Terminology',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: 'docs/',
          label: 'Documentation',
          activeBaseRegex: 'docs/$',
          position: 'left',
        },
        {
          to: 'docs/contribute',
          label: 'Contribution',
          activeBasePath: 'docs/contribute',
          position: 'left',
        },
        {
          href: 'https://gitlab.grnet.gr/devs/docusaurus-terminology',
          label: 'GitLab',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Usage',
              to: 'docs/usage/',
            },
            {
              label: 'Contribution',
              to: 'docs/contribute/',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Docusaurus-Terminology by GRNET, built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateTime: true,
          // Please change this to your repo.
          editUrl:
            'https://gitlab.grnet.gr/devs/docusaurus-terminology/-/tree/master/website',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    [
      '@docusaurus-terminology/parser',
      {
        termsDir: './docs/terminology',
        noParseFiles: [
          './docs/terminology/exclude.md',
	      './docs/exclude2.md',
          './docs/usage.md',
        ],
        glossaryPatternSeparator: '^'
      }
    ]
  ]
};
