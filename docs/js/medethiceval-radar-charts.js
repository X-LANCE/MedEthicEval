/**
 * MedEthicEval Radar Charts for Medical Ethics LLM Leaderboard
 * MedEthicEval基准测试雷达图模块
 */

class MedEthicEvalRadarChartManager {
    constructor() {
        this.charts = {};
        // Deterministic palette for models to ensure legend/series color consistency
        this.palette = [
            '#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272',
            '#FC8452', '#9A60B4', '#EA7CCC', '#2F4554', '#61A0A8', '#D48265',
            '#C23531', '#91C7AE'
        ];
        this.modelNameToColor = {};
        this.nextColorIndex = 0;
    }

    /**
     * Initialize radar charts for MedEthicEval benchmark
     * 初始化MedEthicEval基准测试的雷达图
     */
    initMedEthicEvalCharts() {
        // Combined MedEthicEval Radar Chart with Accuracy and Safe Scores
        this.createRadarChart('medethiceval-combined-radar', {
            title: 'MedEthicEval Benchmark Performance',
            indicators: [
                { name: 'Knowledge Accuracy', max: 1 },
                { name: 'Violation Safety', max: 1 },
                { name: 'Priority Safety', max: 2 },
                { name: 'Equilibrium Safety', max: 2 }
            ],
            dataKey: 'MedEthicEval Combined'
        });
    }

    /**
     * Create a radar chart
     * 创建雷达图
     */
    createRadarChart(containerId, config) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        if (typeof echarts === 'undefined') {
            console.error('ECharts is not loaded');
            return;
        }

        console.log(`Creating MedEthicEval radar chart for ${containerId}`);
        
        // Wait for container to be visible and have dimensions
        const initChart = () => {
            if (container.offsetWidth === 0 || container.offsetHeight === 0) {
                console.log(`Container ${containerId} not ready, retrying...`);
                setTimeout(initChart, 100);
                return;
            }
            
            const chart = echarts.init(container);
            this.charts[containerId] = chart;

            // Default chart configuration
            const option = {
                title: {
                    text: config.title,
                    left: 'center',
                    textStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#333333'
                    }
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function(params) {
                        return `${params.seriesName}<br/>${params.name}: ${params.value}`;
                    }
                },
                legend: {
                    orient: 'vertical',
                    left: 'left',
                    top: 'middle',
                    textStyle: {
                        fontSize: 12
                    }
                },
                radar: {
                    indicator: config.indicators,
                    shape: 'polygon',
                    splitNumber: 5,
                    radius: '60%',
                    center: ['50%', '50%'],
                    name: {
                        textStyle: {
                            color: '#333333',
                            fontSize: 12
                        }
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#e1e5e9'
                        }
                    },
                    splitArea: {
                        show: true,
                        areaStyle: {
                            color: ['rgba(250, 250, 250, 0.1)', 'rgba(200, 200, 200, 0.1)']
                        }
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#e1e5e9'
                        }
                    }
                },
                series: []
            };

            chart.setOption(option);

            // Store config for later data updates
            chart._config = config;
            console.log(`MedEthicEval chart ${containerId} initialized successfully`);
        };
        
        // Start initialization
        initChart();
    }

    /**
     * Update radar chart with data
     * 使用数据更新雷达图
     */
    updateRadarChart(containerId, data) {
        const chart = this.charts[containerId];
        if (!chart || !chart._config) {
            console.warn(`Chart ${containerId} not found or not configured, retrying...`);
            // Wait for chart to be ready and retry
            setTimeout(() => {
                this.updateRadarChart(containerId, data);
            }, 200);
            return;
        }

        console.log(`=== Updating MedEthicEval Radar Chart ===`);
        console.log(`Container: ${containerId}`);
        console.log(`Data received:`, data);
        console.log(`Data length:`, data.length);

        const config = chart._config;
        const seriesData = this.prepareRadarData(data, config);

        console.log(`Prepared series data:`, seriesData);
        console.log(`Number of series:`, seriesData.length);

        // Derive a global color palette from series to keep legend in sync
        const palette = seriesData
            .map(s => (s.color || (s.lineStyle && s.lineStyle.color)))
            .filter(Boolean);

        const option = {
            series: seriesData
        };
        if (palette.length) {
            option.color = palette;
        }

        // Distribute legend items evenly to left and right
        const names = seriesData.map(s => s.name);
        const mid = Math.ceil(names.length / 2);
        const leftNames = names.slice(0, mid);
        const rightNames = names.slice(mid);
        option.legend = [
            {
                type: 'scroll',
                orient: 'vertical',
                left: '2%',
                top: 'middle',
                align: 'left',
                data: leftNames,
                textStyle: {
                    fontSize: 11
                }
            },
            {
                type: 'scroll',
                orient: 'vertical',
                right: '2%',
                top: 'middle',
                align: 'right',
                data: rightNames,
                textStyle: {
                    fontSize: 11
                }
            }
        ];

        console.log(`Final chart option:`, option);
        chart.setOption(option);
        console.log(`Chart updated successfully`);
        console.log(`=== End Radar Chart Update ===`);
    }

    /**
     * Prepare radar chart data
     * 准备雷达图数据
     */
    prepareRadarData(data, config) {
        console.log(`=== Preparing MedEthicEval Radar Data ===`);
        console.log(`Input data:`, data);
        console.log(`Config:`, config);
        
        if (!data || !Array.isArray(data)) {
            console.warn('No MedEthicEval data provided or data is not an array');
            return [];
        }

        console.log(`Preparing MedEthicEval radar data for ${data.length} models`);

        const series = [];
        const modelGroups = this.groupModelsByType(data);
        
        console.log(`Model groups:`, modelGroups);

        Object.keys(modelGroups).forEach(type => {
            const models = modelGroups[type];

            console.log(`Processing ${models.length} MedEthicEval models of type ${type}`);

            models.forEach((model, index) => {
                console.log(`Processing model ${index + 1}/${models.length}: ${model.Model}`);
                console.log(`Model data:`, model);
                
                const values = this.extractRadarValues(model, config);
                console.log(`MedEthicEval Model ${model.Model}: values =`, values);
                
                if (values && values.length > 0) {
                    const seriesColor = this.getSeriesColorForModel(model.Model);
                    const seriesItem = {
                        name: model.Model,
                        type: 'radar',
                        color: seriesColor,
                        lineStyle: {
                            color: seriesColor,
                            width: 3
                        },
                        areaStyle: {
                            color: seriesColor,
                            opacity: 0.15
                        },
                        symbol: 'circle',
                        symbolSize: 4,
                        data: [{
                            value: values,
                            name: model.Model
                        }]
                    };
                    
                    console.log(`Created series item for ${model.Model}:`, seriesItem);
                    series.push(seriesItem);
                } else {
                    console.warn(`No valid values for model ${model.Model}`);
                }
            });
        });

        console.log(`Generated ${series.length} series for MedEthicEval radar chart`);
        console.log(`Series data:`, series);
        console.log(`=== End Preparing Radar Data ===`);
        return series;
    }

    /**
     * Group models by type
     * 按类型分组模型
     */
    groupModelsByType(data) {
        const groups = {};
        data.forEach(model => {
            // MedEthicEval data doesn't have Type field, so we'll group all models together
            const type = model.Type || 'All Models';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(model);
        });
        return groups;
    }

    /**
     * Extract radar values from model data
     * 从模型数据中提取雷达图数值
     */
    extractRadarValues(model, config) {
        const values = [];
        
        config.indicators.forEach(indicator => {
            let value = 0;
            const indicatorName = indicator.name.toLowerCase().replace(/\s+/g, '');
            
            // Map indicator names to model properties
            const propertyMap = this.getPropertyMap(config.dataKey);
            const property = propertyMap[indicatorName];
            
            console.log(`Extracting ${indicator.name}: indicatorName=${indicatorName}, property=${property}, model[property]=${model[property]}, max=${indicator.max}`);
            
            if (property && model[property] !== undefined) {
                value = model[property];
                console.log(`Raw value for ${indicator.name}: ${value}`);
                
                // Handle inverse indicators (like Risk Rate where lower is better)
                if (indicator.inverse) {
                    value = indicator.max - value;
                    console.log(`After inverse for ${indicator.name}: ${value}`);
                }
                
                // Don't normalize - let ECharts handle the display based on indicator.max
                console.log(`Final value for ${indicator.name}: ${value}`);
            }
            
            values.push(value);
        });

        return values;
    }

    /**
     * Get property mapping for different data types
     * 获取不同数据类型的属性映射
     */
    getPropertyMap(dataKey) {
        const mappings = {
            'MedEthicEval Combined': {
                'knowledgeaccuracy': 'Accuracy',
                'violationsafety': 'ViolationSafe',
                'prioritysafety': 'PrioritySafe',
                'equilibriumsafety': 'EquilibriumSafe'
            }
        };

        return mappings[dataKey] || {};
    }

    /**
     * Get series color for model
     * 获取模型的系列颜色
     */
    getSeriesColorForModel(modelName) {
        if (!this.modelNameToColor[modelName]) {
            const color = this.palette[this.nextColorIndex % this.palette.length];
            this.modelNameToColor[modelName] = color;
            this.nextColorIndex += 1;
        }
        return this.modelNameToColor[modelName];
    }

    /**
     * Update all MedEthicEval charts
     * 更新所有MedEthicEval图表
     */
    updateMedEthicEvalCharts(medEthicEvalData) {
        console.log('=== MedEthicEval Radar Chart Update ===');
        console.log('Raw MedEthicEval data:', medEthicEvalData);
        
        // Combine MedEthicEval data for the radar chart
        const combinedData = this.combineMedEthicEvalData(medEthicEvalData);
        console.log('Combined MedEthicEval data:', combinedData);
        console.log('Number of combined models:', combinedData.length);
        
        if (combinedData.length > 0) {
            console.log('Updating radar chart with data...');
            this.updateRadarChart('medethiceval-combined-radar', combinedData);
            console.log('Radar chart update completed');
        } else {
            console.warn('No MedEthicEval data to display');
        }
        console.log('=== End MedEthicEval Update ===');
    }

    /**
     * Combine MedEthicEval data (Knowledge, Violation, Priority, Equilibrium)
     * 合并MedEthicEval数据
     */
    combineMedEthicEvalData(medEthicEvalData) {
        console.log('=== Combining MedEthicEval Data ===');
        console.log('Input data keys:', Object.keys(medEthicEvalData));
        
        const knowledgeData = medEthicEvalData['Knowledge'] || [];
        const violationData = medEthicEvalData['Detecting Violation'] || [];
        const priorityData = medEthicEvalData['Priority Dilemma'] || [];
        const equilibriumData = medEthicEvalData['Equilibrium Dilemma'] || [];
        
        console.log('Data lengths:', {
            knowledge: knowledgeData.length,
            violation: violationData.length,
            priority: priorityData.length,
            equilibrium: equilibriumData.length
        });
        
        // Create maps for all datasets
        const knowledgeMap = {};
        knowledgeData.forEach(item => {
            knowledgeMap[item.Model] = item;
        });
        
        const violationMap = {};
        violationData.forEach(item => {
            violationMap[item.Model] = item;
        });
        
        const priorityMap = {};
        priorityData.forEach(item => {
            priorityMap[item.Model] = item;
        });
        
        const equilibriumMap = {};
        equilibriumData.forEach(item => {
            equilibriumMap[item.Model] = item;
        });
        
        // Get all unique model names
        const allModels = new Set([
            ...knowledgeData.map(item => item.Model),
            ...violationData.map(item => item.Model),
            ...priorityData.map(item => item.Model),
            ...equilibriumData.map(item => item.Model)
        ]);
        
        console.log('All unique models:', Array.from(allModels));
        
        // Combine data for all models
        const combinedData = [];
        allModels.forEach(modelName => {
            const knowledgeItem = knowledgeMap[modelName];
            const violationItem = violationMap[modelName];
            const priorityItem = priorityMap[modelName];
            const equilibriumItem = equilibriumMap[modelName];
            
            // Use default values for missing data
            const combinedItem = {
                Model: modelName,
                Params: knowledgeItem?.Params || violationItem?.Params || priorityItem?.Params || equilibriumItem?.Params || 'unknown',
                // Knowledge metrics
                Accuracy: knowledgeItem?.Accuracy !== undefined ? knowledgeItem.Accuracy : 0,
                // Safety scores
                ViolationSafe: violationItem?.Safe !== undefined ? violationItem.Safe : 0,
                PrioritySafe: priorityItem?.Safe !== undefined ? priorityItem.Safe : 0,
                EquilibriumSafe: equilibriumItem?.Safe !== undefined ? equilibriumItem.Safe : 0
            };
            
            console.log(`Combined data for ${modelName}:`, combinedItem);
            combinedData.push(combinedItem);
        });
        
        console.log('Final combined data:', combinedData);
        console.log('=== End Combining Data ===');
        return combinedData;
    }

    /**
     * Resize all charts
     * 调整所有图表大小
     */
    resizeCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.resize) {
                chart.resize();
            }
        });
    }

    /**
     * Destroy all charts
     * 销毁所有图表
     */
    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.dispose) {
                chart.dispose();
            }
        });
        this.charts = {};
    }
}

// Global MedEthicEval radar chart manager instance
window.medEthicEvalRadarChartManager = new MedEthicEvalRadarChartManager();

// Auto-resize charts on window resize
window.addEventListener('resize', () => {
    if (window.medEthicEvalRadarChartManager) {
        window.medEthicEvalRadarChartManager.resizeCharts();
    }
});
