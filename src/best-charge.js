var Items = require('./items')()
var Promotion = require('./promotions')()
module.exports = function bestCharge(selectedItems) {
  const total = getTotal(selectedItems);
  const totalWithPromotion = getPromotions(total);
  const receipt = generateReceipt(totalWithPromotion);
  return receipt;
}

function getTotal(inputs) {
  const result = [];
  const items = require('./items')();
  inputs.forEach(
    item => {
      const id = item.split(" x ")[0];
      const count = item.split(" x ").length > 1 ? parseInt(item.split(" x ")[1]) : 1;
      const receiptItem = result.filter(itemInResult => itemInResult.item.id === id).pop();
      if (receiptItem) receiptItem.count += count;
      else {
        result.push({
          item: items.filter(itemInList => itemInList.id === id).pop(),
          count: count,
          halfPrice: false
        });
      }
    }
  );
  return result;
}

function getPromotions(total) {
  const promotions = require('./promotions')();
  total.forEach(
    item => {
      if (promotions[1].items.includes(item.item.id)) item.halfPrice = true;
    }
  );
  return total;
}

function generateReceipt(totalWithPromotion) {
  let amount = 0;
  let halfPromotion = 0;
  let promotion = 0;
  const promotionList = [];
  const head = '============= 订餐明细 =============\n';
  const end = '===================================';
  let receiptTotal = '';
  let receiptPromo = '';

  totalWithPromotion.forEach(
    item => {
      const subTotal = item.item.price * item.count;
      amount += subTotal;
      if (item.halfPrice) {
        halfPromotion += subTotal / 2;
        promotionList.push(item.item.name);
      }
      receiptTotal += `${item.item.name} x ${item.count} = ${subTotal}元` + '\n';
    }
  );
  receiptTotal += '-----------------------------------\n';

  Promotion = ~~(amount / 30) * 6;

  if (halfPromotion > Promotion) {
    receiptPromo = '使用优惠:\n' +
      `指定菜品半价(${promotionList.join("，")})，省${halfPromotion}元` +
      '\n-----------------------------------\n';
    amount -= halfPromotion;
  } else if (Promotion > 0) {
    receiptPromo = '使用优惠:\n' +
      `满30减6元，省${Promotion}元` +
      '\n-----------------------------------\n';
    amount -= Promotion;
  }

  const info = `总计：${amount}元` + '\n';

  return head + receiptTotal + receiptPromo + info + end;
}
