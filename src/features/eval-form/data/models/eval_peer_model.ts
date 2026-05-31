import { EvalPeer } from '../../domain/entities/eval_peer';

export class EvalPeerModel {
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

  static fromJson(json: Record<string, any>): EvalPeerModel {
    return new EvalPeerModel({
      firstName: json['FirstName'] as string,
      lastName: json['LastName'] as string,
      email: json['correo'] as string,
    });
  }

  toEntity(): EvalPeer {
    return new EvalPeer({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    });
  }
}
