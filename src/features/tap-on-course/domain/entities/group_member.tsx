export class GroupMember {
  constructor(
    public firstName: string,
    public lastName: string,
    public email: string,
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    const f = this.firstName.length > 0 ? this.firstName[0] : '';
    const l = this.lastName.length > 0 ? this.lastName[0] : '';

    return (f + l).toUpperCase();
  }
}