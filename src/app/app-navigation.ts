export const Navigation = [
  {
    id: 'Providers',
    text: 'Providers',
    path: '/workspaces/:workspaceId/providers',
    icon: 'preferences',
    selected: true,
  },

  {
    id: 'DatabaseSchema',
    text: 'DatabaseSchema',
    path: '/workspaces/:workspaceId/database-schema',
    icon: 'tableproperties',
    selected: false,
  },

   {
    id: 'Dashboard',
    text: 'Dashboard',
    path: '/workspaces/:workspaceId/dashboard',
    icon: 'datatrending',
    selected: false,
  },
];
