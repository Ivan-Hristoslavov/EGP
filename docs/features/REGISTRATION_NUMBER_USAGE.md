# Registration Number Usage

## Overview
The Registration Number field in the admin settings is used for **administrative purposes only** and is not displayed on the client-facing website.

## Where it's used:

### 1. **Admin Settings Page** (`/admin/settings`)
- **Location**: Business Information section
- **Purpose**: Store company registration number (e.g., "12345678")
- **Usage**: Administrative reference only
- **Display**: Read-only field in admin interface

### 2. **Database Storage**
- **Table**: `admin_settings`
- **Key**: `registrationNumber`
- **Value**: String (e.g., "12345678")
- **Purpose**: Internal record keeping

### 3. **Not Used In:**
- ❌ Client-facing homepage
- ❌ Trust badges display
- ❌ Logo display logic
- ❌ Public website content

## Current Value
- **Default**: "12345678"
- **Purpose**: Company registration number for administrative reference
- **Visibility**: Admin only

## Recommendations
1. **Keep as is**: Since it's only for admin reference, no changes needed
2. **Optional field**: Can be left empty if not applicable
3. **No frontend impact**: Changes to this field won't affect the client website

## Related Fields
- **Gas Safe Number**: Used for Gas Safe logo display (now optional)
- **MCS Number**: Used for MCS logo display (now optional)
- **Company Status**: Used for business type display 