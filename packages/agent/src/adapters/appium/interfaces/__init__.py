"""
Appium Interfaces

Tool category interfaces for Appium automation.

EXPORTS:
--------
- AppiumTools: Main interface combining all categories
- ConnectionTools: Device connection management
- DataGatheringTools: Data collection (screenshots, page source, etc.)
- ActionTools: UI interactions (tap, swipe, type, etc.)
- NavigationTools: App navigation (back, home, etc.)
- DeviceManagementTools: Device controls
- AppManagementTools: App lifecycle management
"""

from .appium_tools import AppiumTools
from .connection_tools import ConnectionTools
from .data_gathering_tools import DataGatheringTools
from .action_tools import ActionTools
from .navigation_tools import NavigationTools
from .device_management_tools import DeviceManagementTools
from .app_management_tools import AppManagementTools

__all__ = [
    "AppiumTools",
    "ConnectionTools",
    "DataGatheringTools",
    "ActionTools",
    "NavigationTools",
    "DeviceManagementTools",
    "AppManagementTools",
]

