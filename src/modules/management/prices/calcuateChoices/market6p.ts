import { ICalculateChoice } from '../models/calculateChoice.model';
import { IShopProduct } from '../../../../shared/models/shop.model';
import { CalcFunctions } from '../../../../utils/calcFunctions';
import { numberify } from '../../../../utils';

export class Market6pCalculateChoice implements ICalculateChoice {
    public label: string;
    public description: string;

    constructor() {
        this.label = 'Market 6%';
        this.description = 'Reach 6% of market share';
    }

    public calculate = (product: IShopProduct): number => {
        // в расчетах предполагаем, что парсер нам гарантирует 0 или число, если элемент есть в массиве.
        // не паримся с undefined
        if (!product) {
            console.error('No product is provided');
            return 0;
        }

        // в истории продаж всегда должна быть хотя бы одна строка. Пусть с 0, но должна быть
        if (!product.history.length) {
            console.error(`There should be at least one history item`);
            return 0;
        }

        // мое качество сегодня и цена стоящая в окне цены, кач и цена локальных магазов сегодня
        const localPrice = product.report && product.report.localPrice;
        const localQuality = product.report && product.report.localQuality;

        if (!localPrice || !localQuality) {
            console.error(`Product ${product.name} has no report data`);
            return 0;
        }

        // продажи сегодня и цена для тех продаж.
        const priceOld = product.history[0].price;
        const saleOld = product.history[0].quantity;

        // если продаж вообще не было, история будет содержать 1 стру с нулями.
        const isNewProduct = product.history[0].price === 0;

        let price = product.price; // если алго не изменит цену на выходе, то останется старая.
        if (isNewProduct) {
            // когда пришла первая поставка товара, цена еще 0, ставим базовую цену
            if (product.stock > 0 && product.stock === product.deliver) {
                if (product.price === 0) {
                    price = CalcFunctions.calcBaseRetailPrice(product.quality, localPrice, localQuality);
                }
            }

            // если товар уже был и цена стояла а продаж еще не было, плохо это. если не стояло, ставим базовую
            if (product.stock > product.deliver) {
                if (product.price > 0) {
                    console.error(`0 sales for min price (${product.price})`);
                } else {
                    price = CalcFunctions.calcBaseRetailPrice(product.quality, localPrice, localQuality);
                }
            }
        }

        // если на складе пусто, нужно все равно менять цену если продажи были.
        // просто потому что на след раз когда на складе будет товар но не будет продаж, мы долю рынка не увидим.
        if (!isNewProduct) {
            if (saleOld === 0) {
                // товар тока пришел. был перерыв в поставках
                if (product.stock > 0 && product.stock === product.deliver) {
                    if (product.price === 0) {
                        price = CalcFunctions.calcBaseRetailPrice(product.quality, localPrice, localQuality);
                    }
                }

                // товар на складе был, но не продавался
                if (product.stock > product.deliver) {
                    // TODO: как то подумать чтобы если продаж не было не снижать
                    // от установленной а привязаться к прошлым продажам если кач подходит
                    if (product.price === 0) {
                        price = CalcFunctions.calcBaseRetailPrice(product.quality, localPrice, localQuality);
                    } else {
                        console.error(`0 sales for min price (${product.price})`);
                    }
                }
            }

            if (saleOld > 0) {
                // рынок не занят и не все продаем? Снижаем цену. Если продали все то цену чуть повысим
                if (product.share < 4.5) {
                    price = product.stock > product.deliver ? priceOld * (1 - 0.03) : priceOld * (1 + 0.01);
                }

                // рынок занят и продали не все? Цену чуть снижаем. Если все продаем то повышаем цену, иначе продаваться будет больше
                if (product.share > 4.5 && product.share < 6) {
                    price = product.stock > product.deliver ? priceOld * (1 - 0.01) : priceOld * (1 + 0.03);
                }

                if (product.share > 6 && product.share < 7.5) {
                    price = product.stock > product.deliver ? priceOld * (1 + 0.01) : priceOld * (1 + 0.03);
                }

                const k = product.share / 6;
                if (product.share > 7.5) {
                    price = product.stock > product.deliver ? priceOld * (1 + 0.03 * k) : priceOld * (1 + 0.05 * k);
                }
            }
        }
        // если цена уже минимальна а продажи 0, алармить об этом
        return numberify(price.toPrecision(4));
    }
}
