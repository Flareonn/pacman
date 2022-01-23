/**
 * Напиши здесь логику, которая будет решать, куда пойти пакману!
 *
 * @typedef {Object} Point - координаты на карте
 * @property {number} x
 * @property {number} y
 *
 * @typedef {Object} Pickup - Объект "еды", которую можно подбирать или "есть"
 * @property {'pacdot' | 'powerPellet'} type - тип еды
 * @property {Point} position - положение объекта на карте
 * @property {boolean} taken - флаг, был ли объект поднят или "съеден"
 *
 * @typedef {Object} Pacman - Объект пакмана
 * @property {'pacman'} type - тип пакман
 * @property {Point} position - положение пакмана на карте
 *
 * @typedef {Object} Ghost - Объект призрака
 * @property {'ghost'} type - тип призрака
 * @property {Point} position - положение призрака на карте
 *
 * @typedef {Pickup | Pacman | Ghost} Entity - одна из игровых сущностей
 *
 * @param {Entity[]} entities - Массив сущностей на игровой карте
 * @param {string[][]} maze - Начальное состояние игрового лабиринта, где каждое значение это:
 * - 'X' — стена лабиринта
 * - 'o' — еда или "точки", за подбор которых начисляются очки
 * - ' ' — свободное пространство в лабиринте
 * - '@' - Пакман
 * @return {'up' | 'down' | 'left' | 'right'} направление, в которое надо пойти пакману
 */
// y - 1 ВВЕРХ
// y + 1 ВНИЗ
// x - 1 ВЛЕВО
// x + 1 ВПРАВО

class Graph {
    constructor() {
        this.verticles = {}; // список смежности графа
    }
    addVertex(value) {
        if(!this.verticles[value]) {
            this.verticles[value] = {};
        }
    }
    addEdge(vertex1, vertex2, weight = 1) {
        if(!(vertex1 in this.verticles) || !(vertex2 in this.verticles)) {
            throw new Error("В графе нет таких вершин");
        }
        if(!this.verticles[vertex1][vertex2]) {
            this.verticles[vertex1][vertex2] = weight;
        }
        if(!this.verticles[vertex2][vertex1]) {
            this.verticles[vertex2][vertex1] = weight;
        }
    }
    dfs(startVertex, callback) {
        let list = this.verticles; // список смежности
        let stack = [startVertex]; // стек вершин для перебора
        let visited = { [startVertex]: 1 }; // посещенные вершины
        
        function handleVertex(vertex) {
          // вызываем коллбэк для посещенной вершины
          callback(vertex);
          
          // получаем список смежных вершин
          let reversedNeighboursList = [...Object.keys(list[vertex])].reverse();
         
          reversedNeighboursList.forEach(neighbour => {
            if (!visited[neighbour]) {
              // отмечаем вершину как посещенную
              visited[neighbour] = 1;
              // добавляем в стек
              stack.push(neighbour);
            }
          });
        }
        
        // перебираем вершины из стека, пока он не опустеет
        while(stack.length) {
          let activeVertex = stack.pop();
          handleVertex(activeVertex);
        }
    }
    bfs2(startVertex) {
        let list = this.verticles; 
        let queue = [startVertex];
        let visited = { [startVertex]: 1 }; 
        
        // кратчайшее расстояние от стартовой вершины
        let distance = { [startVertex]: 0 }; 
        // предыдущая вершина в цепочке
        let previous = { [startVertex]: null };
    
        function handleVertex(vertex) {
          let neighboursList = list[vertex];

          for(let neighbour in neighboursList) {
              if (!visited[neighbour]) {
              visited[neighbour] = 1;
              queue.push(neighbour);
              // сохраняем предыдущую вершину
              previous[neighbour] = vertex;
              // сохраняем расстояние 
              distance[neighbour] = distance[vertex] + 1;
            }
          }
        }
    
        // перебираем вершины из очереди, пока она не опустеет
        while(queue.length) {
          let activeVertex = queue.shift();
          handleVertex(activeVertex);
        }
        
        return { distance, previous };
    }
    findShortestPath(startVertex, finishVertex) {
        console.log(startVertex, finishVertex, "FINDER")
        let result = dijkstra(this.verticles, startVertex);
        // this.bfs2(startVertex);

        if (!(finishVertex in result.previous)) { 
            throw new Error(`Нет пути из вершины ${startVertex} в вершину ${finishVertex}`);
        }
            
        let path = [];
        
        let currentVertex = finishVertex;
        
        while(currentVertex !== startVertex) {
          path.unshift(currentVertex);
          currentVertex = result.previous[currentVertex];
        }
        
        return path;
    }
}
const DIRECTION = {
    RIGHT(pos) {
        const right = pos.x + 1;
        return {
            x: right > MAX_WIDTH ? 0 : right,
            y: pos.y,
        };
    },
    LEFT(pos) {
        const left = pos.x - 1;
        return {
            x: left < 0 ? MAX_WIDTH : left,
            y: pos.y
        };
    },
    UP(pos) {
        const up = pos.y - 1;
        return {
            x: pos.x,
            y: up < 0 ? MAX_HEIGHT : up,
        };
    },
    DOWN(pos) {
        const down = pos.y + 1;
        return {
            x: pos.x,
            y: down > MAX_HEIGHT ? 0 : down,
        };
    },
};

/**
 * Функция, рассчитывающая в какую сторону можно идти пакману
 * @param {Object} point, - точка
*/
function getAdjacences(point) {
    const adj = [];
    // Узнаём что находится в каждой стороне, но получаем только координаты
    const where = {
        UP: DIRECTION.UP(point),
        DOWN: DIRECTION.DOWN(point),
        LEFT: DIRECTION.LEFT(point),
        RIGHT: DIRECTION.RIGHT(point),
    };
    for(let direction in where) {
        let {y, x} = where[direction]; // берём координаты у каждой стороны
        if(y > MAX_HEIGHT || x > MAX_WIDTH || y < 0 || x < 0) {
            continue; // Если координаты указывают на несуществующую точку, то пропустить итерацию
        }
        if(MAZE[y][x] !== "X" && MAZE[y][x] !== "×") { // Если это не привидение и не стена, то добавить как возможный ход
            adj.push(where[direction]);
        }
    }
    return adj;
}

const graph = new Graph();
let MAZE;
let MAX_HEIGHT;
let MAX_WIDTH;
const MAP = [];
let strategy = [];

/**
 * Функция передвижения пакмана
 * @param {Object} step, - шаг, куда идти
 * @param {Object} pacman, - текущая позиция пакмана
*/
function mover(step, pacman) {
    console.log(step, "STEP", pacman, "PACMAN \tFROM MOVER");
    if(step.x === MAX_WIDTH && pacman.x === 0) {
        return "left";
    }
    if(step.x === 0 && pacman.x === MAX_WIDTH) {
        return "right";
    }
    if(step.y === MAX_HEIGHT && pacman.y === 0) {
        return "up";
    }
    if(step.y === 0 && pacman.y === MAX_HEIGHT) {
        return "down";
    }

    if(step.x < pacman.x) {
        return "left";
    }
    if(step.x > pacman.x) {
        return "right";
    }
    if(step.y < pacman.y) {
        return "up";
    }
    if(step.y > pacman.y) {
        return "down";
    }
}

function pacmanDirectionHandler(entities, maze) {
    MAZE = maze;
    MAX_HEIGHT = MAZE.length - 1;
    MAX_WIDTH = MAZE[0].length - 1;
    
    const pacman = entities.find(item => item.type === "pacman");

    // GRAPH ADD ТОЧКИ
    entities.forEach(element => {
        if(["pacdot", "powerPellet", "pacman"].includes(element.type)) {
            const CURRENT_VERTEX = `${element.position.y} ${element.position.x}`;
            graph.addVertex(CURRENT_VERTEX);
        }
    });
    
    // GRAPH ADD РЁБРА
    entities.forEach(element => {
        if(["pacdot", "powerPellet", "pacman"].includes(element.type)) {
            const CURRENT_VERTEX = `${element.position.y} ${element.position.x}`;

            for(let direction of getAdjacences(element.position)) {
                if(["o","O"].includes(maze[direction.y][direction.x])) {
                    graph.addEdge(CURRENT_VERTEX, `${direction.y} ${direction.x}`);
                }
            }
        }
    });
    
    const PACMAN_POSITION = `${pacman.position.y} ${pacman.position.x}`;
    let distances = dijkstra(graph.verticles, PACMAN_POSITION).distances;

    console.log(finishVertex, "FINISH VERTEX")
    if(!strategy.length) {
        strategy = graph.findShortestPath(PACMAN_POSITION, finishVertex).reverse();
    }
    // if(!MAP.length) {
        //     graph.dfs(PACMAN_POSITION, (vertex) => {
            //         const [y, x] = vertex.split(" ");
            //         let entity = entities.find(entity => entity.position.x === +x && entity.position.y === +y);
            //         if(entity.type === "pacdot" && !entity.taken) {
                //             MAP.push(vertex);
                //         }
                //     });
                // }
    console.log(strategy);
    let [y, x] = strategy.pop().split(" ");
    const normalizePath = {y: Number(y), x: Number(x)};
    const result = mover(normalizePath, pacman.position);
    console.log(result);
    return result;
}

function dijkstra(graph, startVertex) {
    let visited = {};
    let distances = {}; // кратчайшие пути из стартовой вершины
    let previous = {}; // предыдущие вершины
      
    let vertices = Object.keys(graph); // список вершин графа
    
    // по умолчанию все расстояния неизвестны (бесконечны)
    vertices.forEach(vertex => {
      distances[vertex] = Infinity;
      previous[vertex] = null;
    });
  
    // расстояние до стартовой вершины равно 0
    distances[startVertex] = 0;
  
    function handleVertex(vertex) {
      // расстояние до вершины
      let activeVertexDistance = distances[vertex]; 
      
      // смежные вершины (с расстоянием до них)
      let neighbours = graph[activeVertex];
      
      // для всех смежных вершин пересчитать расстояния
      Object.keys(neighbours).forEach(neighbourVertex => {
        // известное на данный момент расстояние
        let currentNeighbourDistance = distances[neighbourVertex];
        // вычисленное расстояние
        let newNeighbourDistance = activeVertexDistance + neighbours[neighbourVertex];
        
        if (newNeighbourDistance < currentNeighbourDistance) {
          distances[neighbourVertex] = newNeighbourDistance;
          previous[neighbourVertex] = vertex;
        }
      });
      
      // пометить вершину как посещенную
      visited[vertex] = 1;
    }
    
    // ищем самую близкую вершину из необработанных
    let activeVertex = findNearestVertex(distances, visited);
  
    // продолжаем цикл, пока остаются необработанные вершины 
    while(activeVertex) {
      handleVertex(activeVertex);
      activeVertex = findNearestVertex(distances, visited);
    }
    
    return { distances, previous };
}

function findNearestVertex(distances, visited) {
    let minDistance = Infinity;
    let nearestVertex = null;
  
    Object.keys(distances).forEach(vertex => {
      if (!visited[vertex] && distances[vertex] < minDistance) {
        minDistance = distances[vertex];
        nearestVertex = vertex;
      }
    });
  
    return nearestVertex;
}

export default pacmanDirectionHandler;