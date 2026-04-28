import { ILocalPreferences } from '@/src/core/iLocalPreferences';
import { CourseEvaluationModel } from '../models/course_evaluation_model';
import {
  CourseGroupModel,
  GroupCategoryModel,
  GroupMemberModel,
} from '../models/group_category_model';
import { CsvGroupParser } from '../parsers/csv_group_parser';
import { TapCourseDatasource } from './tap_course_datasource';

export class RemoteTapCourseDatasource implements TapCourseDatasource {
  private readonly contract: string;
  private readonly baseUrl = 'https://roble-api.openlab.uninorte.edu.co';

  constructor(
    private readonly csvParser: CsvGroupParser,
    private readonly prefs: ILocalPreferences,
    projectId = process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID,
  ) {
    if (!projectId) throw new Error('Missing EXPO_PUBLIC_ROBLE_PROJECT_ID env var');
    this.contract = projectId;
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    const token = await this.prefs.retrieveData<string>('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getCourseEvaluations(courseId: string): Promise<CourseEvaluationModel[]> {
    const url = new URL(`${this.baseUrl}/database/${this.contract}/read`);
    url.searchParams.set('tableName', 'evaluations');
    url.searchParams.set('course_id', courseId);

    const response = await fetch(url.toString(), { headers: await this.buildHeaders() });

    if (!response.ok) {
      const body = await response.text();
      console.error(`getCourseEvaluations error ${response.status}: ${body}`);
      throw new Error(`Error fetching evaluations: ${response.status}`);
    }

    const rows: Record<string, any>[] = await response.json();
    await this.closeExpiredEvaluations(rows);
    return rows.map(CourseEvaluationModel.fromJson);
  }

  private async closeExpiredEvaluations(rows: Record<string, any>[]): Promise<void> {
    const now = new Date();

    for (const row of rows) {
      if (row['status'] !== 'active') continue;

      const deadline = row['deadline'] ? new Date(row['deadline']) : null;
      if (!deadline || deadline > now) continue;

      const id = row['_id']?.toString();
      if (!id) continue;

      const url = `${this.baseUrl}/database/${this.contract}/update`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: await this.buildHeaders(),
        body: JSON.stringify({
          tableName: 'evaluations',
          idColumn: '_id',
          idValue: id,
          updates: { status: 'closed' },
        }),
      });

      if (response.ok) {
        row['status'] = 'closed';
      } else {
        const body = await response.text();
        console.error(`closeExpiredEvaluations error ${response.status}: ${body}`);
      }
    }
  }

  async getCourseGroups(courseId: string): Promise<GroupCategoryModel[]> {
    const categoriesUrl = new URL(`${this.baseUrl}/database/${this.contract}/read`);
    categoriesUrl.searchParams.set('tableName', 'group_categories');
    categoriesUrl.searchParams.set('course_id', courseId);

    const categoriesResponse = await fetch(categoriesUrl.toString(), { headers: await this.buildHeaders() });

    if (!categoriesResponse.ok) {
      console.error(`getCourseGroups categories error ${categoriesResponse.status}`);
      throw new Error(`Error fetching group_categories: ${categoriesResponse.status}`);
    }

    const categoriesJson: Record<string, any>[] = await categoriesResponse.json();
    const result: GroupCategoryModel[] = [];

    for (const categoryJson of categoriesJson) {
      const categoryName = categoryJson['name'] as string;

      const grupitosUrl = new URL(`${this.baseUrl}/database/${this.contract}/read`);
      grupitosUrl.searchParams.set('tableName', 'grupitos');
      grupitosUrl.searchParams.set('GroupCategory', categoryName);

      const grupitosResponse = await fetch(grupitosUrl.toString(), { headers: await this.buildHeaders() });

      if (!grupitosResponse.ok) {
        console.error(`getCourseGroups grupitos error ${grupitosResponse.status}`);
        continue;
      }

      const rows: Record<string, any>[] = await grupitosResponse.json();

      const byGroup = new Map<string, Record<string, any>[]>();
      for (const row of rows) {
        const groupName = row['Groupname'] as string;
        if (!byGroup.has(groupName)) byGroup.set(groupName, []);
        byGroup.get(groupName)!.push(row);
      }

      const groups: CourseGroupModel[] = Array.from(byGroup.entries()).map(([name, members]) =>
        new CourseGroupModel(
          name,
          members[0]['GroupCode'] as string,
          members.map(
            (row) => new GroupMemberModel(
              row['FirstName'] as string,
              row['LastName'] as string,
              row['correo'] as string,
            ),
          ),
        ),
      );

      result.push(new GroupCategoryModel(categoryName, categoryJson['source'] as string, groups));
    }

    return result;
  }

  async importGroupsFromCsv(csvContent: string, courseId: string): Promise<GroupCategoryModel[]> {
    const categories = this.csvParser.parse(csvContent);

    const existingUrl = new URL(`${this.baseUrl}/database/${this.contract}/read`);
    existingUrl.searchParams.set('tableName', 'group_categories');
    existingUrl.searchParams.set('course_id', courseId);

    const existingResponse = await fetch(existingUrl.toString(), { headers: await this.buildHeaders() });

    const existingNames = new Set<string>();
    if (existingResponse.ok) {
      const existing: Record<string, any>[] = await existingResponse.json();
      for (const e of existing) existingNames.add(e['name'] as string);
    }

    const newCategories = categories.filter((c) => !existingNames.has(c.name));
    if (newCategories.length === 0) return [];

    for (const category of newCategories) {
      await this.insertGroupCategory(courseId, category.name);
    }

    await this.insertGrupitos(newCategories);

    return newCategories;
  }

  private async insertGroupCategory(courseId: string, name: string): Promise<void> {
    const url = `${this.baseUrl}/database/${this.contract}/insert`;

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify({
        tableName: 'group_categories',
        records: [{ course_id: courseId, name, source: 'CSV', created_at: new Date().toISOString() }],
      }),
    });

    if (response.status !== 201) {
      const body = await response.text();
      console.error(`insertGroupCategory error ${response.status}: ${body}`);
      throw new Error(`Error inserting group_category: ${response.status}`);
    }
  }

  private async insertGrupitos(categories: GroupCategoryModel[]): Promise<void> {
    const url = `${this.baseUrl}/database/${this.contract}/insert`;

    const records: Record<string, any>[] = [];
    for (const category of categories) {
      for (const group of category.groups) {
        for (const member of group.members) {
          records.push({
            GroupCategory: category.name,
            Groupname: group.name,
            GroupCode: group.code,
            FirstName: member.firstName,
            LastName: member.lastName,
            correo: member.email,
          });
        }
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: await this.buildHeaders(),
      body: JSON.stringify({ tableName: 'grupitos', records }),
    });

    if (response.status !== 201) {
      const body = await response.text();
      console.error(`insertGrupitos error ${response.status}: ${body}`);
      throw new Error(`Error inserting grupitos: ${response.status}`);
    }
  }
}
