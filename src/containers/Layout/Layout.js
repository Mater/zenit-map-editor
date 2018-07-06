import React from 'react';
import {
  Tab, Tabs, TabList, TabPanel
} from 'react-tabs';

import 'react-tabs/style/react-tabs.css';

/**
 * Main application layout with tabs
 * @returns {XML} Layout markup
 * @constructor
 */
function Layout() {
  return (
    <div className="Layout">
      <Tabs>
        <TabList>
          <Tab>
            Model
          </Tab>
          <Tab>
            Map
          </Tab>
        </TabList>
      </Tabs>

      <TabPanel>
        Model
      </TabPanel>

      <TabPanel>
        Map
      </TabPanel>
    </div>
  );
}

export default Layout;
