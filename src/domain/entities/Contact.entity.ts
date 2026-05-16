import { BaseEntity } from "@shared/entitie/base.entity";
import { Entity, OneToOne } from "typeorm";
import { Application } from "./Application.entity";

@Entity()
export class Contact extends BaseEntity{

  name: string;

  email: string;

  role: string;

  @OneToOne((type)=> Application, (application)=> application.contact)
  application: Application;
}