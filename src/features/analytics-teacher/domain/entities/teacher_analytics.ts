export class StudentComment {
  constructor(
    public readonly evaluatorEmail: string,
    public readonly text: string,
  ) {}
}

export class StudentSummary {
  constructor(
    public readonly email: string,
    public readonly displayName: string,
    public readonly punctuality: number,
    public readonly contributions: number,
    public readonly commitment: number,
    public readonly attitude: number,
    public readonly comments: StudentComment[] = [],
  ) {}

  get avgScore(): number {
    return (this.punctuality + this.contributions + this.commitment + this.attitude) / 4;
  }

  get initials(): string {
    const parts = this.displayName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0].length > 0) return parts[0][0].toUpperCase();
    return "?";
  }
}

export class ActivityAverage {
  constructor(
    public readonly evaluationName: string,
    public readonly avgScore: number,
  ) {}
}

export class GroupAverage {
  constructor(
    public readonly groupName: string,
    public readonly avgScore: number,
  ) {}
}

export class TeacherAnalytics {
  constructor(
    public readonly courseName: string,
    public readonly perActivity: ActivityAverage[],
    public readonly perGroup: GroupAverage[],
    public readonly perStudent: StudentSummary[],
  ) {}
}