document.addEventListener("DOMContentLoaded", async function() {
  const wrapper = document.getElementById("stockbadge-wrapper");
  if (!wrapper) return;

  const shop = wrapper.getAttribute("data-shop");
  if (!shop) return;

  let inventoryQuantity = parseInt(wrapper.getAttribute("data-inventory"), 10);
  
  if (isNaN(inventoryQuantity)) {
    return; // Could not determine inventory
  }

  console.log("StockBadge initialized with inventory:", inventoryQuantity);

  // Fetch settings from our public API endpoint
  try {
    console.log("Fetching settings for shop:", shop);
    const settingsResponse = await fetch(`/apps/stockbadge/api/settings?shop=${shop}`);
    
    if (!settingsResponse.ok) {
      console.error("StockBadge API Error:", settingsResponse.status, await settingsResponse.text());
      return;
    }

    const settings = await settingsResponse.json();
    console.log("StockBadge settings loaded:", settings);
    
    // Check if the app is globally disabled by the merchant
    if (settings.active === false) {
      console.log("StockBadge is disabled in App settings.");
      return;
    }
    
    // Compare inventory with threshold
    if (inventoryQuantity <= settings.threshold) {
      const badgeText = settings.badgeText.replace("{count}", inventoryQuantity);
      
      const badgeDiv = document.createElement("div");
      badgeDiv.textContent = badgeText;
      
      // Apply styles
      badgeDiv.style.backgroundColor = settings.badgeBgColor;
      badgeDiv.style.color = settings.badgeTextColor;
      badgeDiv.style.fontSize = settings.badgeFontSize;
      badgeDiv.style.padding = settings.badgePadding;
      badgeDiv.style.borderRadius = settings.badgeBorderRadius;
      badgeDiv.style.display = "inline-block";
      
      wrapper.appendChild(badgeDiv);
      console.log("StockBadge added to DOM!");

      // Track the view/alert
      fetch(`/apps/stockbadge/api/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shop: shop,
          eventType: "alert" // Since it's shown, it's an alert
        }),
        keepalive: true
      }).catch(err => console.error("Failed to track stock badge view", err));
    }
  } catch (err) {
    console.error("Error fetching stockbadge settings", err);
  }
});
