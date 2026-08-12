import { FOOTER_COLUMNS } from "../../constants/footer-links";
import { FooterColumn } from "./FooterColumn";

export function FooterLinks() {
  return (
    <div
      className="grid gap-4 sm:gap-8 lg:gap-12"
      style={{
        gridTemplateColumns: `repeat(${FOOTER_COLUMNS.length}, minmax(0, 1fr))`,
      }}
    >
      {FOOTER_COLUMNS.map((column) => (
        <FooterColumn
          key={column.title}
          title={column.title}
          links={column.links}
        />
      ))}
    </div>
  );
}
