import {
  Document,
  Paragraph,
  TextRun,
  Packer,
  HeadingLevel,
  AlignmentType,
  TabStopType,
  TabStopPosition,
  BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { sortResumeItemsByDate } from "./resumeSchema";

const formatMonthYear = (month, year, fallbackPresent = false) => {
  if (month && year) return `${month} ${year}`;
  if (year) return `${year}`;
  if (month) return `${month}`;
  return fallbackPresent ? "Present" : "";
};

const buildDateRange = ({
  startMonth,
  startYear,
  endMonth,
  endYear,
  isCurrent = false,
}) => {
  const start = formatMonthYear(startMonth, startYear);
  const end = isCurrent ? "Present" : formatMonthYear(endMonth, endYear);

  if (start && end) return `${start} - ${end}`;
  if (start) return start;
  if (end) return end;
  return "";
};

const cleanInlineText = (value = "") => {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizeParagraph = (value = "") => {
  return cleanInlineText(String(value || "").replace(/\n+/g, " "));
};

const extractBullets = (value = "") => {
  const raw = String(value || "").replace(/\r/g, "").trim();
  if (!raw) return [];

  return raw
    .split(/\n+|•|●|▪|◦|^\s*[-*]\s+/gm)
    .map((item) => cleanInlineText(item))
    .filter(Boolean);
};

const normalizeLinks = (links = []) => {
  if (!Array.isArray(links)) return [];

  return links
    .map((link) => {
      if (typeof link === "string") return cleanInlineText(link);
      if (link && typeof link === "object") {
        return cleanInlineText(link.url || link.link || link.value || "");
      }
      return "";
    })
    .filter(Boolean);
};

const getArray = (value) => (Array.isArray(value) ? value : []);

const normalizeCustomSectionLines = (content = []) => {
  const ignoredKeys = new Set([
    "id",
    "clientKey",
    "resumeId",
    "sortOrder",
    "createdAt",
    "updatedAt",
    "__typename",
  ]);

  const collect = (value) => {
    if (value === null || value === undefined) return [];

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      const text = cleanInlineText(value);
      return text ? [text] : [];
    }

    if (Array.isArray(value)) {
      return value.flatMap(collect);
    }

    if (typeof value === "object") {
      const preferredKeys = [
        "title",
        "name",
        "role",
        "company",
        "organization",
        "institution",
        "label",
        "subtitle",
        "text",
        "description",
        "summary",
        "value",
        "link",
      ];

      const preferred = preferredKeys
        .map((key) => cleanInlineText(value?.[key]))
        .filter(Boolean);

      if (preferred.length > 0) {
        return preferred;
      }

      return Object.entries(value)
        .filter(([key]) => !ignoredKeys.has(key))
        .flatMap(([, nested]) => collect(nested));
    }

    return [];
  };

  return (Array.isArray(content) ? content : []).flatMap(collect).filter(Boolean);
};


const normalizeSkillGroups = (skills = []) => {
  if (!Array.isArray(skills)) return [];

  const groups = [];

  skills.forEach((item) => {
    if (!item) return;

    if (typeof item === "string") {
      const values = item
        .split(",")
        .map((s) => cleanInlineText(s))
        .filter(Boolean);

      if (values.length) {
        groups.push({
          category: "Skills",
          values,
        });
      }
      return;
    }

    const category = cleanInlineText(
      item.category || item.section || item.label || "Skills"
    );

    let values = [];

    if (Array.isArray(item.skills)) {
      values = item.skills
        .map((s) =>
          typeof s === "string"
            ? cleanInlineText(s)
            : cleanInlineText(s?.name || s?.label || s?.value || "")
        )
        .filter(Boolean);
    } else if (typeof item.skills === "string") {
      values = item.skills
        .split(",")
        .map((s) => cleanInlineText(s))
        .filter(Boolean);
    }

    if (values.length) {
      groups.push({
        category,
        values,
      });
    }
  });

  return groups;
};

const createSectionHeader = (text) => [
  new Paragraph({
    children: [
      new TextRun({
        text: cleanInlineText(text).toUpperCase(),
        bold: true,
        size: 20,
      }),
    ],
    spacing: { before: 180, after: 30 },
  }),
  new Paragraph({
    border: {
      bottom: {
        color: "9CA3AF",
        value: BorderStyle.SINGLE,
        size: 4,
        space: 1,
      },
    },
    spacing: { after: 70 },
  }),
];

const createBullet = (text) =>
  new Paragraph({
    text: cleanInlineText(text),
    bullet: { level: 0 },
    spacing: { after: 35 },
  });

const createJustifiedParagraph = (text, after = 60) =>
  new Paragraph({
    text: normalizeParagraph(text),
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after },
  });

const createEntryHeader = ({
  title = "",
  subtitle = "",
  dateText = "",
  titleSize = 22,
  subtitleSize = 18,
  dateSize = 18,
  before = 80,
  afterTitle = 16,
  afterSubtitle = 26,
}) => {
  const blocks = [];

  blocks.push(
    new Paragraph({
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      children: [
        new TextRun({
          text: cleanInlineText(title),
          bold: true,
          size: titleSize,
        }),
        ...(dateText
          ? [
              new TextRun({
                text: "\t",
              }),
              new TextRun({
                text: cleanInlineText(dateText),
                bold: true,
                size: dateSize,
              }),
            ]
          : []),
      ],
      spacing: { before, after: afterTitle },
    })
  );

  if (subtitle) {
    blocks.push(
      new Paragraph({
        text: cleanInlineText(subtitle),
        spacing: { after: afterSubtitle },
        children: [
          new TextRun({
            text: cleanInlineText(subtitle),
            size: subtitleSize,
            color: "4B5563",
          }),
        ],
      })
    );
  }

  return blocks;
};

const addDescriptionBlock = (sections, text, asBullets = true) => {
  const bullets = extractBullets(text);

  if (asBullets && bullets.length > 0) {
    bullets.forEach((bullet) => sections.push(createBullet(bullet)));
    return;
  }

  const paragraphText = normalizeParagraph(text);
  if (!paragraphText) return;

  sections.push(createJustifiedParagraph(paragraphText, 55));
};

export const generateWordDocument = async (resumeData) => {
  const {
    contact = {},
    summary = {},
    experience = [],
    education = [],
    skills = [],
    projects = [],
    certifications = [],
    achievements = [],
    customSections = [],
  } = resumeData || {};

  const sections = [];

  const visibleSkillGroups = normalizeSkillGroups(skills);

  const visibleExperience = Array.isArray(experience)
    ? sortResumeItemsByDate(experience).filter(
        (item) =>
          cleanInlineText(item?.role) ||
          cleanInlineText(item?.company) ||
          cleanInlineText(item?.description)
      )
    : [];

  const visibleEducation = Array.isArray(education)
    ? sortResumeItemsByDate(education).filter(
        (item) =>
          cleanInlineText(item?.institution) ||
          cleanInlineText(item?.degreeMajor)
      )
    : [];

  const visibleProjects = Array.isArray(projects)
    ? sortResumeItemsByDate(projects).filter(
        (item) =>
          cleanInlineText(item?.title) || cleanInlineText(item?.description)
      )
    : [];

  const visibleCertifications = Array.isArray(certifications)
    ? certifications.filter(
        (item) =>
          cleanInlineText(item?.name) ||
          cleanInlineText(item?.issuingBody) ||
          cleanInlineText(item?.skillsCovered)
      )
    : [];

  const visibleAchievements = Array.isArray(achievements)
    ? achievements.filter(
        (item) =>
          cleanInlineText(item?.title) ||
          cleanInlineText(item?.organizerOrRank) ||
          cleanInlineText(item?.description)
      )
    : [];

  const summaryText = normalizeParagraph(summary?.text);

  const contactLine1 = [
    cleanInlineText(contact?.email),
    cleanInlineText(contact?.phone),
    cleanInlineText(contact?.location),
  ].filter(Boolean);

  const contactLine2 = [
    cleanInlineText(contact?.linkedinUrl).replace(/^https?:\/\//, ""),
    cleanInlineText(contact?.githubUrl).replace(/^https?:\/\//, ""),
    ...normalizeLinks(contact?.otherLinks).map((item) =>
      item.replace(/^https?:\/\//, "")
    ),
  ].filter(Boolean);

  const fullName = cleanInlineText(contact?.fullName || "YOUR NAME");
  const targetRole = cleanInlineText(contact?.targetRole);

  sections.push(
    new Paragraph({
      tabStops: [
        {
          type: TabStopType.RIGHT,
          position: TabStopPosition.MAX,
        },
      ],
      children: [
        new TextRun({
          text: fullName.toUpperCase(),
          bold: true,
          size: 30,
        }),
        ...(contactLine1.length > 0
          ? [
              new TextRun({ text: "\t" }),
              new TextRun({
                text: contactLine1.join(" | "),
                size: 18,
              }),
            ]
          : []),
      ],
      spacing: { after: 45 },
    })
  );

  if (targetRole || contactLine2.length > 0) {
    sections.push(
      new Paragraph({
        tabStops: [
          {
            type: TabStopType.RIGHT,
            position: TabStopPosition.MAX,
          },
        ],
        children: [
          new TextRun({
            text: targetRole,
            size: 22,
            color: "4B5563",
            bold: false,
          }),
          ...(contactLine2.length > 0
            ? [
                new TextRun({ text: "\t" }),
                new TextRun({
                  text: contactLine2.join(" | "),
                  size: 18,
                  color: "374151",
                }),
              ]
            : []),
        ],
        spacing: { after: 70 },
      })
    );
  }

  sections.push(
    new Paragraph({
      border: {
        bottom: {
          color: "111827",
          value: BorderStyle.SINGLE,
          size: 6,
          space: 1,
        },
      },
      spacing: { after: 100 },
    })
  );

  if (summaryText) {
    sections.push(...createSectionHeader("Professional Summary"));
    sections.push(createJustifiedParagraph(summaryText, 70));
  }

  if (visibleSkillGroups.length > 0) {
    sections.push(...createSectionHeader("Core Skills"));

    visibleSkillGroups.forEach((group) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${cleanInlineText(group.category)}: `,
              bold: true,
              size: 20,
            }),
            new TextRun({
              text: group.values.join(" • "),
              size: 20,
            }),
          ],
          spacing: { after: 42 },
        })
      );
    });
  }

  if (visibleExperience.length > 0) {
    sections.push(...createSectionHeader("Professional Experience"));

    visibleExperience.forEach((item) => {
      const dateText = buildDateRange({
        startMonth: item?.startMonth,
        startYear: item?.startYear,
        endMonth: item?.endMonth,
        endYear: item?.endYear,
        isCurrent: !!item?.currentlyWorking,
      });

      const subtitle = [
        cleanInlineText(item?.company),
        cleanInlineText(item?.location),
        cleanInlineText(item?.employmentType),
      ]
        .filter(Boolean)
        .join(" | ");

      sections.push(
        ...createEntryHeader({
          title: cleanInlineText(item?.role || item?.company),
          subtitle,
          dateText,
        })
      );

      addDescriptionBlock(sections, item?.description, true);
    });
  }

  if (visibleProjects.length > 0) {
    sections.push(...createSectionHeader("Projects"));

    visibleProjects.forEach((item) => {
      const dateText = buildDateRange({
        startMonth: item?.startMonth,
        startYear: item?.startYear,
        endMonth: item?.endMonth,
        endYear: item?.endYear,
        isCurrent: !!item?.currentlyWorking,
      });

      const subtitle = [
        cleanInlineText(item?.projectType),
        cleanInlineText(item?.organization),
        cleanInlineText(item?.link).replace(/^https?:\/\//, ""),
      ]
        .filter(Boolean)
        .join(" | ");

      sections.push(
        ...createEntryHeader({
          title: cleanInlineText(item?.title),
          subtitle,
          dateText,
        })
      );

      addDescriptionBlock(sections, item?.description, true);
    });
  }

  if (visibleEducation.length > 0) {
    sections.push(...createSectionHeader("Education"));

    visibleEducation.forEach((item) => {
      const dateText = buildDateRange({
        startMonth: item?.startMonth,
        startYear: item?.startYear,
        endMonth: item?.endMonth,
        endYear: item?.endYear,
        isCurrent: !!item?.currentlyStudying,
      });

      const subtitle = [
        cleanInlineText(item?.degreeMajor),
        cleanInlineText(item?.cityState),
        cleanInlineText(item?.cgpaOrPercentage),
      ]
        .filter(Boolean)
        .join(" | ");

      sections.push(
        ...createEntryHeader({
          title: cleanInlineText(item?.institution),
          subtitle,
          dateText,
        })
      );

      const description = normalizeParagraph(item?.description);
      if (description) {
        sections.push(createJustifiedParagraph(description, 45));
      }
    });
  }

  if (visibleCertifications.length > 0) {
    sections.push(...createSectionHeader("Certifications"));

    visibleCertifications.forEach((item) => {
      const issued = formatMonthYear(item?.issuedMonth, item?.issuedYear);

      const line = [
        cleanInlineText(item?.name),
        cleanInlineText(item?.issuingBody),
        issued,
      ]
        .filter(Boolean)
        .join(" | ");

      if (line) {
        sections.push(createBullet(line));
      }
    });
  }

  if (visibleAchievements.length > 0) {
    sections.push(...createSectionHeader("Achievements"));

    visibleAchievements.forEach((item) => {
      const awarded = formatMonthYear(item?.month, item?.year);

      const line = [
        cleanInlineText(item?.title),
        cleanInlineText(item?.organizerOrRank),
        cleanInlineText(item?.category),
        awarded,
      ]
        .filter(Boolean)
        .join(" | ");

      if (line) {
        sections.push(createBullet(line));
      }
    });
  }

    if (Array.isArray(customSections) && customSections.length > 0) {
  customSections.forEach((section) => {
    const label = cleanInlineText(section?.label);
    const lines = normalizeCustomSectionLines(section?.content);

    if (!label || lines.length === 0) return;

    sections.push(...createSectionHeader(label));

    lines.forEach((line) => {
      addDescriptionBlock(sections, line, true);
    });
  });
}

  const doc = new Document({
    creator: "Career Copilot",
    title: `${fullName} Resume`,
    description: "ATS-friendly professional resume export",
    styles: {
      default: {
        document: {
          run: {
            font: "Arial",
            size: 20,
            color: "111827",
          },
          paragraph: {
            spacing: {
              line: 276,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const fileName = `${cleanInlineText(contact?.fullName || "Resume").replace(
    /\s+/g,
    "_"
  )}.docx`;

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
};