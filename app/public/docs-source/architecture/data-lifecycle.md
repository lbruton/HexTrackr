# Data Lifecycle and Rollover Mechanism

This document describes the data lifecycle in HexTrackr and the rollover mechanism that manages it.

---

## Overview

HexTrackr uses a rollover mechanism to manage vulnerability data over time. This allows for historical trend analysis while keeping the current vulnerability data set clean and up-to-date.

---

## Staging Tables

When new vulnerability data is imported, it is first loaded into a staging table. This allows for data validation and processing before it is moved into the production tables.

- `vulnerabilities_staging`: Used for staging new vulnerability data.

---

## Rollover Process

The rollover process is triggered after a successful data import into the staging tables.

1. **Data Validation**: Data in the staging tables is validated for correctness and completeness.
2. **Data Archiving**: Existing data in the production tables is archived to historical tables.
3. **Data Promotion**: New data from the staging tables is promoted to the production tables.
4. **Staging Cleanup**: The staging tables are cleared.

---

## Data Retention

Historical data is retained indefinitely to allow for long-term trend analysis.
