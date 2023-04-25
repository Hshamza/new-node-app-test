import { MenuItem } from './entities/menu-item.entity';
import { Repository } from "typeorm";
import App from "../../app";

export class MenuItemsService {

  private menuItemRepository: Repository<MenuItem>;

  constructor(app: App) {
    this.menuItemRepository = app.getDataSource().getRepository(MenuItem);
  }

  /* TODO: complete getMenuItems so that it returns a nested menu structure
    Requirements:
    - your code should result in EXACTLY one SQL query no matter the nesting level or the amount of menu items.
    - it should work for infinite level of depth (children of childrens children of childrens children, ...)
    - verify your solution with `npm run test`
    - do a `git commit && git push` after you are done or when the time limit is over
    - post process your results in javascript
    Hints:
    - open the `src/menu-items/menu-items.service.ts` file
    - partial or not working answers also get graded so make sure you commit what you have
    Sample response on GET /menu:
    ```json
    [
        {
            "id": 1,
            "name": "All events",
            "url": "/events",
            "parentId": null,
            "createdAt": "2021-04-27T15:35:15.000000Z",
            "children": [
                {
                    "id": 2,
                    "name": "Laracon",
                    "url": "/events/laracon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 3,
                            "name": "Illuminate your knowledge of the laravel code base",
                            "url": "/events/laracon/workshops/illuminate",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 4,
                            "name": "The new Eloquent - load more with less",
                            "url": "/events/laracon/workshops/eloquent",
                            "parentId": 2,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                },
                {
                    "id": 5,
                    "name": "Reactcon",
                    "url": "/events/reactcon",
                    "parentId": 1,
                    "createdAt": "2021-04-27T15:35:15.000000Z",
                    "children": [
                        {
                            "id": 6,
                            "name": "#NoClass pure functional programming",
                            "url": "/events/reactcon/workshops/noclass",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        },
                        {
                            "id": 7,
                            "name": "Navigating the function jungle",
                            "url": "/events/reactcon/workshops/jungle",
                            "parentId": 5,
                            "createdAt": "2021-04-27T15:35:15.000000Z",
                            "children": []
                        }
                    ]
                }
            ]
        }
    ]
  */

  async getMenuItems() {
    const result = await this.menuItemRepository.query(`
    WITH RECURSIVE cte AS (
      SELECT path.id, path.name, path.parentId, ARRAY[id] AS path
      FROM menu
      WHERE parentId IS NULL
    
      UNION ALL
    
      SELECT m.id, m.name, m.parentId, c.level + 1, c.path || m.id
      FROM menu m
      JOIN cte c ON c.id = m.parentId
    )
    SELECT c1.id, c1.name, c1.parentId, c1.level, c1.path,
      COALESCE(JSON_AGG(
        CASE
          WHEN c2.id IS NOT NULL THEN JSON_OBJECT('id', c2.id, 'name', c2.name, 'parentId', c2.parentId, 'level', c2.level, 'path', c2.path, 'children', c2.children)
          ELSE NULL
        END
      ), '[]') AS children
    FROM cte c1
    LEFT JOIN cte c2 ON c1.path <@ c2.path AND c2.level = c1.level + 1
    GROUP BY c1.id
    ORDER BY c1.path;
    
    `);

    const menuItems = result.map((row: any) => ({
      id: row.id,
      name: row.name,
      parentId: row.parentId,
      children: row.children,

    }));

    const lookup: Record<number, MenuItem> = {};
  menuItems.forEach((menuItem:any) => {
    lookup[menuItem.id] = menuItem;
  });

  // Nest the menu items under their parent
  const nestedMenuItems: MenuItem[] = [];
  menuItems.forEach((menuItem:any) => {
    if (menuItem.parentId) {
      const parent = lookup[menuItem.parentId];
      parent.children.push(menuItem);
    } else {
      nestedMenuItems.push(menuItem);
    }
  });

  return nestedMenuItems;

    
  }
}
