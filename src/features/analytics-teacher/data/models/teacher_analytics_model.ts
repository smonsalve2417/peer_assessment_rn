import {
  ActivityAverage,
  GroupAverage,
  StudentComment,
  StudentSummary,
  TeacherAnalytics,
} from "../../domain/entities/teacher_analytics";

export class TeacherAnalyticsModel {
  constructor(
    public readonly rows: Record<string, any>[],
    public readonly emailToDisplayName: Record<string, string>,
    public readonly emailToGroupName: Record<string, string>,
    public readonly evalIdToName: Record<string, string>,
  ) {}

  static fromJson(json: {
    rows: Record<string, any>[];
    emailToDisplayName: Record<string, string>;
    emailToGroupName: Record<string, string>;
  }, evalIdToName: Record<string, string>): TeacherAnalyticsModel {
    return new TeacherAnalyticsModel(
      json.rows,
      json.emailToDisplayName,
      json.emailToGroupName,
      evalIdToName,
    );
  }

  toJson() {
    return {
      rows: this.rows,
      emailToDisplayName: this.emailToDisplayName,
      emailToGroupName: this.emailToGroupName,
    };
  }

  toEntity(courseName: string): TeacherAnalytics {
    if (this.rows.length === 0) {
      return new TeacherAnalytics(courseName, [], [], []);
    }

    const avg = (subset: Record<string, any>[]): number => {
      if (subset.length === 0) return 0;
      const scores = subset.map(r =>
        ((r.punctuality ?? 0) + (r.contributions ?? 0) + (r.commitment ?? 0) + (r.attitude ?? 0)) / 4
      );
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    };

    const criterion = (subset: Record<string, any>[], key: string): number => {
      if (subset.length === 0) return 0;
      return subset.map(r => r[key] ?? 0).reduce((a, b) => a + b, 0) / subset.length;
    };

    // Per activity
    const perActivity: ActivityAverage[] = Object.entries(this.evalIdToName).map(([id, name]) => {
      const subset = this.rows.filter(r => r.evaluation_id?.toString() === id);
      return new ActivityAverage(name, avg(subset));
    });

    // Per group
    const byGroup: Record<string, Record<string, any>[]> = {};
    for (const row of this.rows) {
      const email = row.evaluated_email ?? "";
      const group = this.emailToGroupName[email] ?? "Unknown";
      if (!byGroup[group]) byGroup[group] = [];
      byGroup[group].push(row);
    }
    const perGroup: GroupAverage[] = Object.entries(byGroup).map(
      ([groupName, rows]) => new GroupAverage(groupName, avg(rows))
    );

    // Per student
    const byStudent: Record<string, Record<string, any>[]> = {};
    for (const row of this.rows) {
      const email = row.evaluated_email ?? "";
      if (!byStudent[email]) byStudent[email] = [];
      byStudent[email].push(row);
    }
    const perStudent: StudentSummary[] = Object.entries(byStudent)
      .map(([email, rows]) => {
        const comments = rows
          .filter(r => r.comment && r.comment.trim().length > 0)
          .map(r => new StudentComment(r.evaluator_email ?? "", r.comment));
        return new StudentSummary(
          email,
          this.emailToDisplayName[email] ?? email,
          criterion(rows, "punctuality"),
          criterion(rows, "contributions"),
          criterion(rows, "commitment"),
          criterion(rows, "attitude"),
          comments,
        );
      })
      .sort((a, b) => b.avgScore - a.avgScore);

    return new TeacherAnalytics(courseName, perActivity, perGroup, perStudent);
  }
}