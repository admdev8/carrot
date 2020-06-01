import {PoolNodeType} from "../../../enums/NodeType";
import {IdentityActivation} from "../../../methods/Activation";
import {PoolNode} from "../../Nodes/PoolNode";
import {PoolingLayer} from "./PoolingLayer";

/**
 * Maximum pooling layer 1D
 */
export class MaxPooling1DLayer extends PoolingLayer {
    constructor(outputSize: number, options: {
        /**
         * The activation type for the output nodes of this layer.
         */
        activation?: ((x: number, derivative: boolean) => number)
    } = {}) {
        super(outputSize);

        const activationType: ((x: number, derivative: boolean) => number) = options.activation ?? IdentityActivation;

        for (let i: number = 0; i < outputSize; i++) {
            this.inputNodes.add(new PoolNode(PoolNodeType.MAX_POOLING).setActivationType(activationType));
        }

        this.outputNodes = this.inputNodes;
        this.nodes.push(...Array.from(this.inputNodes));
    }
}
