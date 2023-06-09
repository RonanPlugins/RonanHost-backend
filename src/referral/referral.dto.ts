import { IsNumber, IsString } from 'class-validator';

export class ReferralDto {
  @IsString()
  token: string;

  @IsNumber()
  uses: number;

  @IsString()
  owner: string;

  @IsString()
  additional_info: string;
}

export class TokenDto implements Partial<ReferralDto> {
  token: ReferralDto['token'];
}
