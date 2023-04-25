import { Column, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MenuItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    url: string;

    @Column({ type: 'integer', default: null })
    parentId: number;

    @Column({ type: 'datetime' })
    createdAt: string;

    @OneToMany(() => MenuItem, (menuItem) => menuItem.parent)
    children: MenuItem[];
  
    @ManyToOne(() => MenuItem, (menuItem) => menuItem.children)
    parent: MenuItem;
}
