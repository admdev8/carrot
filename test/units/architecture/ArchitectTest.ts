import {BinaryStep, Identitiy, Logistic, RELU} from "activations/build/src";
import {expect} from "chai";
import {Architect} from "../../../src/architecture/Architect";
import {DenseLayer} from "../../../src/architecture/Layers/CoreLayers/DenseLayer";
import {InputLayer} from "../../../src/architecture/Layers/CoreLayers/InputLayer";
import {OutputLayer} from "../../../src/architecture/Layers/CoreLayers/OutputLayer";
import {MaxPooling1DLayer} from "../../../src/architecture/Layers/PoolingLayers/MaxPooling1DLayer";
import {GRULayer} from "../../../src/architecture/Layers/RecurrentLayers/GRULayer";
import {HopfieldLayer} from "../../../src/architecture/Layers/RecurrentLayers/HopfieldLayer";
import {LSTMLayer} from "../../../src/architecture/Layers/RecurrentLayers/LSTMLayer";
import {MemoryLayer} from "../../../src/architecture/Layers/RecurrentLayers/MemoryLayer";
import {RNNLayer} from "../../../src/architecture/Layers/RecurrentLayers/RNNLayer";
import {Network} from "../../../src/architecture/Network";
import {Node} from "../../../src/architecture/Node";
import {PoolNode} from "../../../src/architecture/Nodes/PoolNode";
import {TrainOptions} from "../../../src/interfaces/TrainOptions";
import {FixedRate} from "../../../src/methods/Rate";
import {randInt} from "../../../src/utils/Utils";

describe("ArchitectTest", () => {
    it("Build Multilayer-Perceptron", () => {
        const layerSizes: number[] = [randInt(5, 10), randInt(10, 20), randInt(5, 10)];

        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(10));
        architect.addLayer(new DenseLayer(layerSizes[0], {activationType: RELU}));
        architect.addLayer(new DenseLayer(layerSizes[1], {activationType: RELU}));
        architect.addLayer(new DenseLayer(layerSizes[2], {activationType: RELU}));
        architect.addLayer(new OutputLayer(2));

        const network: Network = architect.buildModel();

        expect(network.nodes.length).to.be.equal(10 + layerSizes[0] + layerSizes[1] + layerSizes[2] + 2);
        expect(network.connections.size).to.be.equal(10 * layerSizes[0] + layerSizes[0] * layerSizes[1] + layerSizes[1] * layerSizes[2] + layerSizes[2] * 2);
        expect(network.gates.size).to.be.equal(0);

        const numNodesWithRELU: number = network.nodes.filter(node => node.squash === RELU).length;
        expect(numNodesWithRELU).to.be.equal(layerSizes[0] + layerSizes[1] + layerSizes[2]);
    });

    it("Build Perceptron with pooling layer", () => {
        const layerSize: number = randInt(2, 4);

        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(10));
        architect.addLayer(new DenseLayer(10, {activationType: RELU}));
        architect.addLayer(new MaxPooling1DLayer(layerSize, {activation: Identitiy}));
        architect.addLayer(new OutputLayer(2, {activation: RELU}));

        const network: Network = architect.buildModel();

        expect(network.nodes.length).to.be.equal(10 + 10 + layerSize + 2);
        expect(network.connections.size).to.be.equal(10 * 10 + 10 + layerSize * 2);
        expect(network.gates.size).to.be.equal(0);

        const numNodesWithRELU: number = network.nodes.filter(node => node.squash === RELU).length;
        expect(numNodesWithRELU).to.be.equal(10 + 2);

        const poolNodes: Node[] = network.nodes.filter(node => node instanceof PoolNode);
        expect(poolNodes.length).to.be.equal(layerSize);
        poolNodes.forEach(node => expect(node.bias).to.be.equal(1));

        const numNodesWithIdentity: number = network.nodes.filter(node => node.squash === Identitiy).length;
        expect(numNodesWithIdentity).to.be.equal(layerSize);
    });

    it("Build Multilayer-Perceptron with memory layer", () => {
        const memorySize: number = randInt(5, 15);
        const outputSize: number = randInt(20, 30);

        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(10));
        architect.addLayer(new DenseLayer(10, {activationType: RELU}));
        architect.addLayer(new MemoryLayer(outputSize, {memorySize, activation: RELU}));
        architect.addLayer(new DenseLayer(20, {activationType: RELU}));
        architect.addLayer(new DenseLayer(10, {activationType: RELU}));
        architect.addLayer(new OutputLayer(2));

        const network: Network = architect.buildModel();

        expect(network.nodes.length).to.be.equal(10 + 10 + outputSize * (memorySize + 1) + 20 + 10 + 2);
        expect(network.connections.size).to.be.equal(10 * 10 + 10 * outputSize + memorySize * outputSize + outputSize * 20 + 20 * 10 + 10 * 2);
        expect(network.gates.size).to.be.equal(0);

        const numNodesWithRELU: number = network.nodes.filter(node => node.squash === RELU).length;
        expect(numNodesWithRELU).to.be.equal(10 + outputSize + 20 + 10);
    });

    it("Build RNN layer", () => {
        const outputSize: number = randInt(20, 30);

        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(10));
        architect.addLayer(new DenseLayer(10, {activationType: Logistic}));
        architect.addLayer(new RNNLayer(outputSize, {activation: RELU}));
        architect.addLayer(new DenseLayer(2, {activationType: Logistic}));
        architect.addLayer(new OutputLayer(2));

        const network: Network = architect.buildModel();

        expect(network.nodes.length).to.be.equal(10 + 10 + outputSize + 2 + 2);
        expect(network.connections.size).to.be.equal(10 * 10 + 10 * outputSize + outputSize + outputSize * 2 + 2 * 2);
        expect(network.gates.size).to.be.equal(0);

        const numNodesWithRELU: number = network.nodes.filter(node => node.squash === RELU).length;
        expect(numNodesWithRELU).to.be.equal(outputSize);
    });

    it("Build GRU network", () => {
        const GRUSize: number = randInt(10, 20);

        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(10));

        architect.addLayer(new GRULayer(GRUSize, {activation: RELU}));

        architect.addLayer(new OutputLayer(2));

        const network: Network = architect.buildModel();

        expect(network.nodes.length).to.be.equal(10 + GRUSize * 7 + 2);

        // 10 * GRUSize (input -> LSTM)
        // GRUSize * GRUSize * 8 + GRUSize (LSTM intern connection)
        // GRUSize * 2 (LSTM -> output)
        expect(network.connections.size).to.be.equal(10 * GRUSize + GRUSize * GRUSize * 8 + 2 * GRUSize + GRUSize * 2);

        expect(network.gates.size).to.be.equal(3 * GRUSize * GRUSize);

        const numNodesWithRELU: number = network.nodes.filter(node => node.squash === RELU).length;
        expect(numNodesWithRELU).to.be.equal(GRUSize);
    });

    it("Build LSTM network", () => {
        const LSTMSize: number = randInt(10, 20);

        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(10));

        architect.addLayer(new LSTMLayer(LSTMSize, {activation: RELU}));

        architect.addLayer(new OutputLayer(2));

        const network: Network = architect.buildModel();

        expect(network.nodes.length).to.be.equal(10 + LSTMSize * 6 + 2);

        // 10 * LSTMSize (input -> LSTM)
        // LSTMSize * LSTMSize * 8 + LSTMSize (LSTM intern connection)
        // LSTMSize * 2 (LSTM -> output)
        expect(network.connections.size).to.be.equal(10 * LSTMSize + LSTMSize * LSTMSize * 8 + LSTMSize + LSTMSize * 2);

        expect(network.gates.size).to.be.equal(2 * LSTMSize * LSTMSize + LSTMSize);

        const numNodesWithRELU: number = network.nodes.filter(node => node.squash === RELU).length;
        expect(numNodesWithRELU).to.be.equal(LSTMSize);
    });

    it("Build Hopfield network", () => {
        const HopfieldSize: number = randInt(10, 20);

        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(10));
        architect.addLayer(new HopfieldLayer(HopfieldSize));
        architect.addLayer(new OutputLayer(2));

        const network: Network = architect.buildModel();

        expect(network.nodes.length).to.be.equal(10 + HopfieldSize * 2 + 2);

        // Check backward pointing connections
        let backConnections: number = 0;
        for (let i: number = 0; i < network.nodes.length; i++) {
            network.nodes[i].outgoing.forEach(conn => {
                if (network.nodes.indexOf(conn.to) < i) {
                    backConnections++;
                }
            });
        }
        expect(backConnections).to.be.equal(HopfieldSize * HopfieldSize);

        // 10 * HopfieldSize (input -> LSTM)
        // HopfieldSize * HopfieldSize * 8 + HopfieldSize (LSTM intern connection)
        // HopfieldSize * 2 (LSTM -> output)
        expect(network.connections.size).to.be.equal(10 * HopfieldSize + HopfieldSize * HopfieldSize * 2 + HopfieldSize * 2);

        expect(network.gates.size).to.be.equal(0);

        const numNodesWithSTEP: number = network.nodes.filter(node => node.squash === BinaryStep).length;
        expect(numNodesWithSTEP).to.be.equal(HopfieldSize);
    });

    it("Train Perceptron", function () {
        this.timeout(5000);
        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(2));
        architect.addLayer(new DenseLayer(5, {activationType: RELU}));
        architect.addLayer(new OutputLayer(1));

        const network: Network = architect.buildModel();

        const AND_GATE: { input: number[], output: number[] }[] = [
            {input: [0, 0], output: [0]},
            {input: [0, 1], output: [0]},
            {input: [1, 0], output: [0]},
            {input: [1, 1], output: [1]}
        ];

        const errorBefore: number = network.test(AND_GATE);

        const options: TrainOptions = new TrainOptions(AND_GATE);
        options.iterations = 10000;
        options.rate = new FixedRate(0.01);
        options.shuffle = true;
        network.train(options);
        const error: number = network.train(options).error;

        expect(Number.isFinite(error)).to.be.true;
        expect(Number.isFinite(errorBefore)).to.be.true;
        expect(error).to.be.at.most(errorBefore);
    });

    it("Train RNN network", function () {
        this.timeout(5000);
        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(1));
        architect.addLayer(new RNNLayer(2, {activation: RELU}));
        architect.addLayer(new OutputLayer(1));

        const network: Network = architect.buildModel();

        const data: { input: number[], output: number[] }[] = [
            {input: [0], output: [0]},
            {input: [1], output: [1]},
            {input: [1], output: [0]},
            {input: [0], output: [1]},
            {input: [0], output: [0]}
        ];

        const errorBefore: number = network.test(data);

        const options: TrainOptions = new TrainOptions(data);
        options.iterations = 10000;
        options.clear = true;
        options.rate = new FixedRate(0.01);
        network.train(options);
        const error: number = network.train(options).error;


        expect(Number.isFinite(error)).to.be.true;
        expect(Number.isFinite(errorBefore)).to.be.true;
        expect(error).to.be.at.most(errorBefore);
    });

    it("Train LSTM network", function () {
        this.timeout(5000);
        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(1));
        architect.addLayer(new LSTMLayer(2, {activation: RELU}));
        architect.addLayer(new LSTMLayer(2, {activation: RELU}));
        architect.addLayer(new OutputLayer(1));

        const network: Network = architect.buildModel();

        const data: { input: number[], output: number[] }[] = [
            {input: [0], output: [0]},
            {input: [1], output: [1]},
            {input: [1], output: [0]},
            {input: [0], output: [1]},
            {input: [0], output: [0]}
        ];

        const errorBefore: number = network.test(data);

        const options: TrainOptions = new TrainOptions(data);
        options.iterations = 10000;
        options.rate = new FixedRate(0.01);
        options.clear = true;
        network.train(options);
        const error: number = network.train(options).error;

        expect(Number.isFinite(error)).to.be.true;
        expect(Number.isFinite(errorBefore)).to.be.true;
        expect(error).to.be.at.most(errorBefore);
    });

    it('Train GRU network', function () {
        this.timeout(5000);
        const architect: Architect = new Architect();

        architect.addLayer(new InputLayer(1));
        architect.addLayer(new GRULayer(2, {activation: RELU}));
        architect.addLayer(new OutputLayer(1));

        const network: Network = architect.buildModel();

        const data: { output: number[]; input: number[] }[] = [
            {input: [0], output: [0]},
            {input: [1], output: [1]},
            {input: [1], output: [0]},
            {input: [0], output: [1]},
            {input: [0], output: [0]}
        ];

        const errorBefore: number = network.test(data);

        const options: TrainOptions = new TrainOptions(data);
        options.iterations = 10000;
        options.rate = new FixedRate(0.01);
        options.clear = true;
        network.train(options);
        const error: number = network.train(options).error;

        expect(Number.isFinite(error)).to.be.true;
        expect(Number.isFinite(errorBefore)).to.be.true;
        expect(error).to.be.at.most(errorBefore);
    });
});
