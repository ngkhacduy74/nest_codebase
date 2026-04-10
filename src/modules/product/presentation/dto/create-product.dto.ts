import { IsString, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name!: string;

  @IsString()
  description!: string;

  @IsNumber()
  @Min(0.01)
  price!: number;

  @IsNumber()
  @Min(0)
  stock!: number;
}
