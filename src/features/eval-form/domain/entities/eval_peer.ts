export class EvalPeer {
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;

  constructor(data: {
    firstName: string;
    lastName: string;
    email: string;
  }) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get initials(): string {
    const f = this.firstName.length > 0 ? this.firstName[0] : '';
    const l = this.lastName.length > 0 ? this.lastName[0] : '';
    return (f + l).toUpperCase();
  }
}
