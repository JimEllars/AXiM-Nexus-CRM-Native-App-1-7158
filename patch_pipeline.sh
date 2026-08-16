#!/bin/bash
sed -i "s/notificationService.notifyInfo('Pipeline separation coming soon.');/handleTypeChange('b2b');/" src/pages/Pipeline.jsx
sed -i "s/notificationService.notifyInfo('Pipeline separation coming soon.');/handleTypeChange('b2c');/" src/pages/Pipeline.jsx
