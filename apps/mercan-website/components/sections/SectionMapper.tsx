import React from "react";
import { HeroSlider, FeatureGrid, RichText } from "./SectionComponents";

const COMPONENT_MAP: Record<string, React.FC<any>> = {
  SLIDER: HeroSlider,
  FEATURES: FeatureGrid,
  CONTENT: RichText,
  // Diğer tipler buraya eklenebilir
};

export function SectionMapper({ sections }: { sections: any[] }) {
  return (
    <>
      {sections.map((section) => {
        const Component = COMPONENT_MAP[section.type];
        if (!Component) return null;
        return <Component key={section.id} content={section.content} />;
      })}
    </>
  );
}
