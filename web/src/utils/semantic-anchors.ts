// These are the "Ideal Descriptions" for each slider.
// When a user slides "Fruity" to 100%, we search for this concept.

export const SEMANTIC_ANCHORS = {
    fruity: "Explosion of blueberry, strawberry, raspberry, citrus, and crisp fruit notes.",
    nutty: "Deep rich dark chocolate, almond, hazelnut, cocoa, and heavy body.",
    floral: "Delicate jasmine, bergamot, tea-like, honeysuckle, and floral aromatics.",
    sweet: "Sugary sweet, caramel, molasses, brown sugar, and syrup.",
    spicy: "Clove, cinnamon, nutmeg, pepper, and savory spices."
};

export type FlavorProfile = keyof typeof SEMANTIC_ANCHORS;
