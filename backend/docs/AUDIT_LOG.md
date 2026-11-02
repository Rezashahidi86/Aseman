# Audit Log

Aseman's Audit Log records important business mutations with the authenticated actor, actor role, affected branch, action, resource, resource ID, timestamp, and request metadata.

## Access

The read endpoint is:

```http
GET /api/v1/audit-logs
```

Only authenticated users with the `ADMIN` role can access it. Sellers receive `403`.

The endpoint is read-only. There are no application routes for updating or deleting audit records.

## Filters

| Query parameter | Description                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------- |
| `page`          | Page number; defaults to 1                                                                         |
| `limit`         | Records per page; defaults to 25, maximum 100                                                      |
| `action`        | `CREATE`, `UPDATE`, or `DELETE`                                                                    |
| `resource`      | `PRODUCT`, `SALE`, `CUSTOMER`, `USER`, `BRANCH`, `REFERENCE_CATALOG`, `MANUAL_DOCUMENT`, or `NEED` |
| `actor`         | User ObjectId                                                                                      |
| `branch`        | Branch ObjectId                                                                                    |
| `resourceId`    | Affected document ObjectId                                                                         |
| `from`          | Inclusive start date in an ISO-compatible format                                                   |
| `to`            | Inclusive end date in an ISO-compatible format                                                     |

Example:

```http
GET /api/v1/audit-logs?page=1&limit=25&resource=PRODUCT&action=UPDATE
```

Records are returned newest first.

## Recorded operations

- Product creation, edits, stock/price adjustments, and deletion
- Sale creation
- Customer creation, edits, and deletion
- Seller creation, edits, and deactivation
- Branch creation and activation/deactivation
- Reference catalog creation, edits, and deletion
- Manual document creation and deletion
- Need creation and deletion

## Data protection

Audit snapshots use resource-specific allowlists. Passwords, password hashes, email addresses, phone numbers, OTP values, authentication tokens, and arbitrary request-body fields are not copied into change snapshots. Manual document notes and document contents are not copied. Request paths exclude query strings.

Sale creation and its audit record are written in the same MongoDB transaction. If the audit record cannot be stored, the sale transaction does not commit.

The schema marks audit fields immutable through Mongoose, and the application exposes no update/delete endpoint. This is application-level protection; a database administrator with direct database privileges can still alter database records. Protect database credentials and include the audit collection in regular backups.
