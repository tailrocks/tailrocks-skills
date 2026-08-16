//! GraphQL layer of the public billing API. Review target.

use deadpool_postgres::Pool;
use juniper::{graphql_object, FieldResult, GraphQLObject};

pub struct Context {
    pub pool: Pool,
}

impl juniper::Context for Context {}

pub struct Invoice {
    pub id: i32,
    pub customer_id: i32,
    pub total_cents: i32,
    pub status: String,
}

#[derive(GraphQLObject)]
pub struct Customer {
    pub id: i32,
    pub name: String,
    pub email: String,
}

#[graphql_object(context = Context)]
impl Invoice {
    fn id(&self) -> i32 {
        self.id
    }

    fn total_cents(&self) -> i32 {
        self.total_cents
    }

    fn status(&self) -> &str {
        &self.status
    }

    async fn customer(&self, ctx: &Context) -> FieldResult<Customer> {
        let client = ctx.pool.get().await.map_err(|e| e.to_string())?;
        let row = client
            .query_one(
                "SELECT id, name, email FROM customers WHERE id = $1",
                &[&self.customer_id],
            )
            .await
            .map_err(|e| e.to_string())?;
        Ok(Customer {
            id: row.get(0),
            name: row.get(1),
            email: row.get(2),
        })
    }
}

pub struct Query;

#[graphql_object(context = Context)]
impl Query {
    /// All invoices, newest first.
    async fn invoices(ctx: &Context, limit: i32, offset: i32) -> FieldResult<Vec<Invoice>> {
        let client = ctx.pool.get().await.map_err(|e| e.to_string())?;
        let rows = client
            .query(
                "SELECT id, customer_id, total_cents, status FROM invoices \
                 ORDER BY created_at DESC LIMIT $1 OFFSET $2",
                &[&i64::from(limit), &i64::from(offset)],
            )
            .await
            .map_err(|e| e.to_string())?;
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

pub struct Mutation;

#[graphql_object(context = Context)]
impl Mutation {
    async fn update_invoice(ctx: &Context, id: i32, status: String) -> FieldResult<Invoice> {
        let client = ctx.pool.get().await.map_err(|e| e.to_string())?;
        let row = client
            .query_one(
                "UPDATE invoices SET status = $2 WHERE id = $1 \
                 RETURNING id, customer_id, total_cents, status",
                &[&id, &status],
            )
            .await
            .map_err(|e| e.to_string())?;
        Ok(Invoice {
            id: row.get(0),
            customer_id: row.get(1),
            total_cents: row.get(2),
            status: row.get(3),
        })
    }
}
