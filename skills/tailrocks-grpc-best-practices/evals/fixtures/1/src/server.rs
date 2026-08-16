use std::sync::Arc;

use tonic::{Request, Response, Status};

use crate::pb::inventory_server::Inventory;
use crate::pb::{GetItemRequest, Item, ListItemsRequest, ListItemsResponse};
use crate::pricing::pricing_client::PricingClient;
use crate::pricing::PriceRequest;
use crate::repo::ItemRepo;

pub struct InventoryService {
    // The repository stores and returns generated protobuf `Item` values
    // directly, so the persistence layer depends on the proto contract.
    repo: Arc<ItemRepo>,
}

#[tonic::async_trait]
impl Inventory for InventoryService {
    async fn get_item(
        &self,
        request: Request<GetItemRequest>,
    ) -> Result<Response<Item>, Status> {
        let id = request.into_inner().id;
        let item = self.repo.find_item(&id).await.unwrap();
        match item {
            Some(item) => Ok(Response::new(item)),
            None => Err(Status::internal(format!(
                "no row in items for id {id} (SELECT * FROM items WHERE id = $1)"
            ))),
        }
    }

    async fn delete_item(
        &self,
        request: Request<GetItemRequest>,
    ) -> Result<Response<prost_types::Empty>, Status> {
        let id = request.into_inner().id;
        self.repo
            .delete_item(&id)
            .await
            .map_err(|e| Status::internal(e.to_string()))?;
        Ok(Response::new(prost_types::Empty {}))
    }

    async fn list_items(
        &self,
        request: Request<ListItemsRequest>,
    ) -> Result<Response<ListItemsResponse>, Status> {
        let limit = request.into_inner().limit;
        // Loads every row, then truncates in memory.
        let mut items = self.repo.all_items().await.unwrap();
        if limit > 0 {
            items.truncate(limit as usize);
        }
        Ok(Response::new(ListItemsResponse { items }))
    }
}

/// Fetches the current price for an item from the pricing service.
pub async fn fetch_price(id: &str) -> Result<i64, Status> {
    // Opens a fresh connection for every call, with no deadline on the RPC.
    let mut client = PricingClient::connect("http://pricing:50051")
        .await
        .map_err(|e| Status::internal(e.to_string()))?;
    let response = client
        .get_price(Request::new(PriceRequest { id: id.to_owned() }))
        .await?;
    Ok(response.into_inner().unit_price)
}
