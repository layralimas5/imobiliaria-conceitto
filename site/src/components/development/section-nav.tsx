'use client';

import { useEffect, useState } from 'react';

export interface SectionLink {
  readonly id: string;
  readonly label: string;
}

interface SectionNavProps {
  sections: readonly SectionLink[];
}

/**
 * Anchor bar for the launch page, sticking right under the site header.
 * The active item follows the section in view so a long page still tells the
 * visitor where they are.
 */
export function SectionNav({ sections }: SectionNavProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      // Only the band just below the sticky header counts as "in view".
      { rootMargin: '-20% 0px -70% 0px' },
    );

    for (const element of elements) observer.observe(element);
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Seções do empreendimento"
      className="sticky top-16 z-30 border-y border-line bg-paper/90 backdrop-blur-md md:top-20"
    >
      <div className="container-page">
        <ul className="-mx-1 flex gap-1 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            const isActive = section.id === activeId;
            return (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`inline-block whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-forest-700 text-white'
                      : 'text-ink-soft hover:bg-surface-muted hover:text-ink'
                  }`}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
