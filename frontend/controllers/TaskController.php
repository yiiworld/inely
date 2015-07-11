<?php

namespace frontend\controllers;

use frontend\models\Task;
use frontend\models\TaskCat;
use frontend\models\search\TaskSearch;
use Yii;
use yii\db\Query;
use yii\web\Controller;
use yii\data\ActiveDataProvider;
use yii\web\NotFoundHttpException;
use yii\filters\VerbFilter;

/**
 * TaskController implements the CRUD actions for Task model.
 */
class TaskController extends Controller
{
    public function behaviors()
    {
        return [
            'verbs' => [
                'class' => VerbFilter::className(),
                'actions' => [
                    'delete' => ['post'],
                ],
            ],
            /*[
                'class' => 'yii\filters\HttpCache',
                'only' => [
                    'index', 'view'
                ],
                'lastModified' => function() {
                    $q = new Query();
                    return $q->from('tasks')->max('time');
                },
            ],*/
        ];
    }

    /**
     * Lists all Task models.
     * @return mixed
     */
    public function actionIndex()
    {
        $searchModel = new TaskSearch();

        if (Yii::$app->request->isPjax) {
            $dataProvider = $searchModel->searchByCat(Yii::$app->request->get('id'));

            return $this->render('index', [
                'dataProvider' => $dataProvider,
                'searchModel' => $searchModel,
            ]);
        }

        $dataProvider = $searchModel->search(Yii::$app->request->queryParams);

        return $this->render('index', [
            'dataProvider' => $dataProvider,
            'searchModel' => $searchModel,
        ]);
    }

    /**
     * Displays a single TaskCat model.
     * @return mixed
     */
    public function actionCat()
    {
        $dataProvider = new ActiveDataProvider([
            'query' => TaskCat::find()
                ->where(['userId' => Yii::$app->user->id]),
            'sort' => false
        ]);

        return $this->renderAjax('cat/index', [
            'dataProvider' => $dataProvider,
        ]);
    }

    /**
     *
     * @return string

    public function actionSort()
    {
        $searchModel = new TaskSearch();

        if (Yii::$app->request->isPjax) {
            $dataProvider = $searchModel->searchByCat(Yii::$app->request->get('id'));

            return $this->render('index', [
                'dataProvider' => $dataProvider,
                'searchModel' => $searchModel,
            ]);
        }
    } */

    /**
     * Creates a new Task model.
     * If creation is successful, the browser will be redirected to the 'view' page.
     * @return mixed
     */
    public function actionCreate()
    {
        $model = new Task();

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('create', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Updates an existing Task model.
     * If update is successful, the browser will be redirected to the 'view' page.
     * @param integer $id
     * @return mixed
     */
    public function actionUpdate($id)
    {
        $model = $this->findModel($id);

        if ($model->load(Yii::$app->request->post()) && $model->save()) {
            return $this->redirect(['view', 'id' => $model->id]);
        } else {
            return $this->render('update', [
                'model' => $model,
            ]);
        }
    }

    /**
     * Deletes an existing Task model.
     * If deletion is successful, the browser will be redirected to the 'index' page.
     * @param integer $id
     * @return mixed
     */
    public function actionDelete($id)
    {
        $this->findModel($id)->delete();

        return $this->redirect(['index']);
    }

    /**
     * Finds the Task model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return Task the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = Task::findOne($id)) !== null) {
            return $model;
        } else {
            throw new NotFoundHttpException('The requested page does not exist.');
        }
    }
}