//! GraphQL layer of the public billing API. Review target.

use async_graphql::{ComplexObject, Context, Object, Result, SimpleObject};
use deadpool_postgres::Pool;

#[derive(SimpleObject)]
#[graphql(complex)]
pub struct Invoice {
    pub id: i64,
    pub customer_id: i64,
    pub total_cents: i64,
    pub status: String,
}

#[derive(SimpleObject)]
pub struct Customer {
    pub id: i64,
    pub name: String,
    pub email: String,
}

#[ComplexObject]
impl Invoice {
    async fn customer(&self, ctx: &Context<'_>) -> Result<Customer> {
        let pool = ctx.data_unchecked::<Pool>();
        let client = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(e.to_string()))?;
        let row = client
            .query_one(
                "SELECT id, name, email FROM customers WHERE id = $1",
                &[&self.customer_id],
            )
            .await
            .map_err(|e| async_graphql::Error::new(e.to_string()))?;
        Ok(Customer {
            id: row.get(0),
            name: row.get(1),
            email: row.get(2),
        })
    }
}

pub struct QueryRoot;

#[Object]
impl QueryRoot {
    /// All invoices, newest first.
    async fn invoices(
        &self,
        ctx: &Context<'_>,
        limit: i64,
        offset: i64,
    ) -> Result<Vec<Invoice>> {
        let pool = ctx.data_unchecked::<Pool>();
        let client = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(e.to_string()))?;
        let rows = client
            .query(
                "SELECT id, customer_id, total_cents, status FROM invoices \
                 ORDER BY created_at DESC LIMIT $1 OFFSET $2",
                &[&limit, &offset],
            )
            .await
            .map_err(|e| async_graphql::Error::new(e.to_string()))?;
        Ok(rows
            .into_iter()
            .map(|row| Invoice {
                id: row.get(0),
                customer_id: row.get(1),
                total_cents: row.get(2),
                status: row.get(3),
            })
            .collect())
    }
}

pub struct MutationRoot;

#[Object]
impl MutationRoot {
    async fn update_invoice(
        &self,
        ctx: &Context<'_>,
        id: i64,
        status: String,
    ) -> Result<Invoice> {
        let pool = ctx.data_unchecked::<Pool>();
        let client = pool
            .get()
            .await
            .map_err(|e| async_graphql::Error::new(e.to_string()))?;
        let row = client
            .query_one(
                "UPDATE invoices SET status = $2 WHERE id = $1 \
                 RETURNING id, customer_id, total_cents, status",
                &[&id, &status],
            )
            .await
            .map_err(|e| async_graphql::Error::new(e.to_string()))?;
        Ok(Invoice {
            id: row.get(0),
            customer_id: row.get(1),
            total_cents: row.get(2),
            status: row.get(3),
        })
    }
}
