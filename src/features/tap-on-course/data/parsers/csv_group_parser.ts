import {
  CourseGroupModel,
  GroupCategoryModel,
  GroupMemberModel,
} from '../models/group_category_model';

export class CsvGroupParser {
  parse(csvContent: string): GroupCategoryModel[] {
    const lines = csvContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const header = this.splitLine(lines[0]);
    const idxCat   = header.indexOf('Group Category Name');
    const idxGName = header.indexOf('Group Name');
    const idxGCode = header.indexOf('Group Code');
    const idxFName = header.indexOf('First Name');
    const idxLName = header.indexOf('Last Name');
    const idxEmail = header.indexOf('Email Address');

    if ([idxCat, idxGName, idxGCode, idxFName, idxLName, idxEmail].some((i) => i === -1)) {
      return [];
    }

    const categories = new Map<string, { name: string; source: string; groups: Map<string, { name: string; code: string; members: GroupMemberModel[] }> }>();

    for (const line of lines.slice(1)) {
      const parts = this.splitLine(line);
      if (parts.length <= idxEmail) continue;

      const catName   = parts[idxCat];
      const groupName = parts[idxGName];
      const groupCode = parts[idxGCode];
      const firstName = parts[idxFName];
      const lastName  = parts[idxLName];
      const email     = parts[idxEmail];

      if (!categories.has(catName)) {
        categories.set(catName, { name: catName, source: 'Brightspace', groups: new Map() });
      }

      const cat = categories.get(catName)!;
      if (!cat.groups.has(groupName)) {
        cat.groups.set(groupName, { name: groupName, code: groupCode, members: [] });
      }

      cat.groups.get(groupName)!.members.push(
        new GroupMemberModel(firstName, lastName, email),
      );
    }

    return Array.from(categories.values()).map(
      (cat) =>
        new GroupCategoryModel(
          cat.name,
          cat.source,
          Array.from(cat.groups.values()).map(
            (g) => new CourseGroupModel(g.name, g.code, g.members),
          ),
        ),
    );
  }

  private splitLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }

    fields.push(current.trim());
    return fields;
  }
}
