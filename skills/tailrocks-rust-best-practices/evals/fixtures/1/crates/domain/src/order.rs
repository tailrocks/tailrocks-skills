pub struct Order {
    pub id: String,
}

pub fn parse_orders(lines: &[String]) -> Vec<Order> {
    let mut orders = Vec::new();
    for line in lines {
        let id = line.split(',').next().unwrap().to_owned();
        orders.push(Order { id: id.clone() });
    }
    orders
}
